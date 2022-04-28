module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		if (!guild.id) return;
		const mysql = new (require ('../mysql'))();
		const [rows] = mysql.getConnection().execute('SELECT * FROM `servers` WHERE serverId = ?', [guild.id]);
		if (rows[0]) mysql.getConnection().execute('DELETE FROM `servers` WHERE serverId = ?', [guild.id]);
		mysql.updateGuild(guild);
	},
};