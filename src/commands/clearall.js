const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearall')
		.setDescription('♻️ Clears all messages in a channel')
		.setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_CHANNELS)
		.setDMPermission(false),
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();
		// Get the settings for the specified guild id
		const settings = await database.getSettings(interaction.guild);

		if (interaction.guild.rulesChannelId == interaction.channelId) return database.reply(interaction, 'RULES_CHANNEL');
		if (interaction.guild.publicUpdatesChannelId == interaction.channelId) return database.reply(interaction, 'UPDATES_CHANNEL');
		if (interaction.guild.systemChannelId == interaction.channelId) return database.reply(interaction, 'SYSTEM_CHANNEL');

		// Check if the bot has enough permissions to clear the chat history
		let permissions = interaction.channel.permissionsFor(interaction.guild.me);
		if (!permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			if (!permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': 'MANAGE_CHANNELS' });
			// Check if the bot has enough permissions to clone the channel
			let type = 'GUILD';
			permissions = interaction.guild.me.permissions;
			if (interaction.channel.partial) {
				permissions = interaction.channel.parent.permissionsFor(interaction.guild.me);
				type = 'PARTIAL';
			}
			if (!permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': `MANAGE_CHANNELS_${type}` });
			if (settings.showreply && !permissions.has(Permissions.FLAGS.SEND_MESSAGES))
				return database.reply(interaction, 'BOT_NO_PERMS', { 'PERMISSION': `SEND_CHANNELS_${type}` });
		}

		// Clones the channel
		const channel = await interaction.channel.clone();
		// Deletes the old channel
		interaction.channel.delete();

		// Update interaction status and send reply if enabled
		database.reply(interaction, 'RECREATED_CHANNEL', null, false);
		if (settings.showreply) channel.send(await database.getMessage('RECREATED_CHANNEL', interaction));
	},
};