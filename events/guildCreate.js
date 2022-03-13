module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		const mysql = new (require ('../mysql'))();
		mysql.updateGuild(guild);
	},
};