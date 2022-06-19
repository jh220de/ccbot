const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Clear before here')
		.setType(3)
		.setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_MESSAGES)
		.setDMPermission(false),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();
		// Get the settings for the specified guild id
		const settings = await database.getSettings(interaction.guild);

		// Check if the bot has enough permissions to clear the chat history
		const permissions = interaction.channel.permissionsFor(interaction.guild.me);
		if (!permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) return database.reply(interaction, 'BOT_NO_PERMS', { PERMISSION: 'VIEW_CHANNEL' });
			if (!permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return database.reply(interaction, 'BOT_NO_PERMS', { PERMISSION: 'SEND_MESSAGES' });
			if (!permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return database.reply(interaction, 'BOT_NO_PERMS', { PERMISSION: 'MANAGE_MESSAGES' });
			if (settings.showreply && !permissions.has(Permissions.FLAGS.SEND_MESSAGES))
				return database.reply(interaction, 'BOT_NO_PERMS', { PERMISSION: 'SEND_MESSAGES' });
		}

		// Fetch the context message from the interaction
		const reply = await interaction.targetMessage;
		// Fetch messages before the message with the specified amount
		let fetched = await interaction.channel.messages.fetch({ limit: 100, before: reply.id });

		// Filter messages that are not deletable
		fetched = fetched.filter(message => !message.deletable);
		// Filter messages that are pinned
		fetched = fetched.filter(message => !message.pinned);

		// Bulk delete messages
		const messages = await interaction.channel.bulkDelete(fetched, true);
		// Send reply to user and in chat if enabled
		await database.reply(interaction, 'CLEARED_MESSAGES', { MESSAGE_AMOUNT: messages.size });
		if (settings.showreply) interaction.channel.send(await database.getMessage('CLEARED_MESSAGES_BROADCAST', interaction, { MESSAGE_AMOUNT: messages.size, TARGET_ID: interaction.targetId }));
	},
};