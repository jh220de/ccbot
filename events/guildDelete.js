module.exports = {
	name: 'guildDelete',
	async execute(guild) {
		const time = Math.round(Date.now() / 1000);
		const serverId = guild.id;
		if (!serverId) return;
		const mysql = new (require ('../mysql'))();
		if (!mysql) return;
		await mysql.getConnection().execute('UPDATE `servers` SET `botLeave` = ? WHERE `serverId` = ?', [time, serverId]);
		console.log(`Removed ${serverId} from the database.`);
	},
};