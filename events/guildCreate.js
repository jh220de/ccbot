module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		const serverId = guild.id;
		if (!serverId) return;
		const mysql = new (require ('../mysql'))();
		if (!mysql) return;
		const [rows] = mysql.getConnection().execute('SELECT * FROM `servers` WHERE serverId = ?', [serverId]);
		if (rows[0]) mysql.getConnection().execute('DELETE FROM `servers` WHERE serverId = ?', [serverId]);
		mysql.updateGuild(guild);
	},
};