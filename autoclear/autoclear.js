const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autoclear')
		.setDescription('♻️ Clears the channel history after a certain amount of time')
		.addIntegerOption(option => option.setName('duration').setDescription('Specifies after what time (in seconds) the messages should be deleted (default: 3 sec)').setRequired(false))
		.addStringOption(option => option
			.setName('mode')
			.setDescription('Specifies the mode (default: All messages), leave blank to remove current mode.')
			.addChoice('All messages', 'all')
			.addChoice('Only messages from bots', 'bots')
			.addChoice('Only messages from users', 'users')
			.addChoice('Only messages with links', 'links')
			.addChoice('Only messages without links', 'nonlinks')
			.addChoice('Disable autoclear in this channel', 'off')
			.setRequired(false),
		),
	async execute(interaction) {
		const mysql = new (require('../mysql'))();
		if (interaction.guild == null || interaction.channel.type != 'GUILD_TEXT')
			return mysql.reply(interaction, false, 'GUILD_COMMAND', 'You can use this command only on servers!');
		if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_MESSAGES'))
			return mysql.reply(interaction, false, 'BOT_MANAGE_MESSAGES', 'The bot has insufficient permissions to manage messages.');

		let duration = interaction.options.getInteger('duration');
		if (!duration) duration = 3;
		const [rows] = await mysql.getConnection().execute('SELECT * FROM `autoclear` WHERE `channelId` = ?', [interaction.channelId]);
		const mode = interaction.options.getString('mode');

		if (!mode) {
			if (rows[0]) return mysql.reply(interaction, true, 'AUTOCLEAR_INFO', `Current mode: ${rows[0].mode}\nd`);
		}
			

		// if (rows[0]) return mysql.reply(interaction, false, 'NO_SETUP_FOR_DELETION', 'No AutoClear setup was found in this channel that can be deleted.');
		if (duration < 0 || duration > 30)
			return mysql.reply(interaction, false, 'DURATION_OUT_OF_RANGE', 'You need to input a duration between 0 and 30 seconds.');

		await mysql.getConnection().execute('INSERT INTO `autoclear` VALUES (?, ?, ?, ?)', [interaction.channelId, interaction.guildId, duration, mode]);
		await mysql.reply(interaction, true, 'SETUP_COMPLETE', `The mode ${mode} was set successfully in this channel.`);
	},
};