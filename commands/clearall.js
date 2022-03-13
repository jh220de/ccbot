const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearall')
		.setDescription('♻️ Clears all messages in a channel'),
	async execute(interaction) {
		const mysql = new (require('../mysql'))();
		if (interaction.guild == null || interaction.channel.type != 'GUILD_TEXT')
			return mysql.reply(interaction, false, 'GUILD_COMMAND', 'You can use this command only on servers!');
		if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_CHANNELS'))
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		if (interaction.guild.rulesChannelId == interaction.channel.id)
			return mysql.reply(interaction, false, 'RULES_CHANNEL', 'Since this channel has been set as a rules channel, this channel cannot be deleted.');
		if (interaction.guild.publicUpdatesChannelId == interaction.channel.id)
			return mysql.reply(interaction, false, 'UPDATES_CHANNEL', 'Since this channel has been set as a community updates channel, this channel cannot be deleted.');
		if (interaction.guild.systemChannelId == interaction.channel.id)
			return mysql.reply(interaction, false, 'SYSTEM_CHANNEL', 'Since this channel has been set as a system channel, this channel cannot be deleted.');

		if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
			return mysql.reply(interaction, false, 'BOT_MANAGE_CHANNELS', 'The bot has insufficient permissions to manage this channel.');
		if (interaction.channel.partial && !interaction.channel.parent.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
			return mysql.reply(interaction, false, 'BOT_PARTIAL_MANAGE_CHANNELS', 'The bot has insufficient permissions to manage channels in this category.');
		else if (!interaction.guild.me.permissions.has('MANAGE_CHANNELS'))
			return mysql.reply(interaction, false, 'BOT_GUILD_MANAGE_CHANNELS', 'The bot has insufficient permissions to manage channels in this guild.');

		const [rows] = await mysql.getConnection().execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
		const showreply = rows[0].showreply == 1;

		interaction.channel.delete();
		const channel = await interaction.channel.clone();

		if (showreply && channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES'))
			channel.send(`Deleted all messages in this channel by ${interaction.user}.`);
		return mysql.reply(interaction, true, 'CLONED_CHANNEL', null);
	},
};