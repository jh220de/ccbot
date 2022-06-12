const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('♻️ Clears the message history by a specified amount of messages and some additional filters.')
		.setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_MESSAGES)
		.setDMPermission(false)
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('Number of messages to clear')
			.setMinValue(1)
			.setMaxValue(100),
		)
		.addUserOption(option => option.setName('user').setDescription('Filter messages from a specific user'))
		.addRoleOption(option => option.setName('role').setDescription('Filter messages from a specific role'))
		.addBooleanOption(option => option.setName('bot').setDescription('Filter messages sent by bots')),
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();
		// Get the settings for the specified guild id
		const settings = await database.getSettings(interaction.guild);

		// Check if the bot has enough permissions to clear the chat history
		const permissions = interaction.channel.permissionsFor(interaction.guild.me);
		if (!permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			if (!permissions.has(Permissions.FLAGS.VIEW_CHANNEL)) return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': 'VIEW_CHANNEL' });
			if (!permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': 'SEND_MESSAGES' });
			if (!permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': 'MANAGE_MESSAGES' });
			if (settings.showreply && !permissions.has(Permissions.FLAGS.SEND_MESSAGES))
				return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': 'SEND_MESSAGES' });
		}

		// Get amount specified in the interaction
		let amount = interaction.options.getInteger('amount');
		// Set amount to 100 if not specified
		if (!amount) amount = 100;

		// Fetch the reply message from the interaction
		const reply = await interaction.fetchReply();
		// Fetch messages before the reply with the specified amount
		let fetched = await interaction.channel.messages.fetch({ limit: amount, before: reply.id });

		// Filter messages that are pinned
		fetched = fetched.filter(message => !message.pinned);
		// Filter messages from a specific user if specified
		const user = interaction.options.getUser('user');
		if (user) fetched = fetched.filter(message => message.author.id == user.id);
		// Filter messages from a specific role if specified
		const role = interaction.options.getRole('role');
		if (role) fetched = fetched.filter(message => message.member.roles.cache.has(role));
		// Filter messages from bots if specified
		const bot = interaction.options.getBoolean('bot');
		if (bot) fetched = fetched.filter(message => message.member.user.bot);

		// Bulk delete messages
		const messages = await interaction.channel.bulkDelete(fetched, true);
		// Send reply to user and in chat if enabled
		await database.reply(interaction, 'CLEARED_MESSAGES', { 'MESSAGE_AMOUNT': messages.size });
		if (settings.showreply) interaction.channel.send(await database.getMessage('CLEARED_MESSAGES_BROADCAST', interaction, { 'MESSAGE_AMOUNT': messages.size }));
	},
};