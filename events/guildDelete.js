module.exports = {
	name: 'guildDelete',
	async execute(guild) {
		const time = Math.round(Date.now() / 1000);
		const serverId = guild.id;
		new (require ('../mysql'))().getConnection().execute('UPDATE `servers` SET `botLeave` = ? WHERE `serverId` = ?', [time, serverId]);
	},
};