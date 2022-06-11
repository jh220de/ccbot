module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// Gets the current database
		const database = new (require('../database'))();

		// Add the server to the database
		database.updateServer(guild);
	},
};