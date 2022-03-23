module.exports = {
	name: 'messageCreate',
	async execute(message) {
		const mysql = new (require ('../mysql'))();
		const [rows] = await mysql.getConnection().execute('SELECT * FROM `autoclear` WHERE `channelId` = ?', [message.channelId]);
		if (!rows[0]) return;
		if (!this.valid(message.channelId)) return;

		setInterval(() => {
			if (!this.valid(message.channelId)) return;
			message.delete();
		}, rows[0].duration * 1000);
	},
	async valid(channelId) {
		const mysql = new (require ('../mysql'))();
		let [rows] = await mysql.getConnection().execute('SELECT * FROM `autoclear` WHERE `channelId` = ?', [channelId]);

		if (!mysql.voted(rows[0].creatorId, require('ms')('24h'))) return ['NO_VOTE'];
		[rows] = await mysql.getConnection().execute('SELECT * FROM `users` WHERE ', [rows[0].creatorId]);
		if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');
	}
};

async function execute(interaction) {
	const mysql = new (require('../mysql'))();
	if (interaction.guild == null || interaction.channel.type != 'GUILD_TEXT')
		return mysql.reply(interaction, false, 'GUILD_COMMAND', 'You can use this command only on servers!');
	if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
		return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');
	// if (!mysql.voted(interaction.user.id, require('ms')('24h')[0]))

	if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_MESSAGES'))
		return mysql.reply(interaction, false, 'BOT_MANAGE_MESSAGES', 'The bot has insufficient permissions to manage messages.');

	let duration = interaction.options.getInteger('duration');
	if (!duration) duration = 3;
	const [rows] = await mysql.getConnection().execute('SELECT * FROM `autoclear` WHERE `channelId` = ?', [interaction.channelId]);
	const mode = interaction.options.getString('mode');

	if (!mode && rows[0])
		return mysql.reply(interaction, false, 'NO_SETUP_FOR_DELETION', 'No AutoClear setup was found in this channel that can be deleted.');
	if (duration < 0 || duration > 30)
		return mysql.reply(interaction, false, 'DURATION_OUT_OF_RANGE', 'You need to input a duration between 0 and 30 seconds.');

	await mysql.getConnection().execute('INSERT INTO `autoclear` VALUES (?, ?, ?, ?)', [interaction.channelId, interaction.guildId, duration, mode]);
	await mysql.reply(interaction, true, 'SETUP_COMPLETE', `The mode ${mode} was set successfully in this channel.`);
}