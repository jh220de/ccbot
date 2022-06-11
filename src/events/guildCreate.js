module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// Returns if bot is not ready
		if (!(new (require('./database'))().getConnection())) return;

		// Gets the current database
		const database = new (require('../database'))();

		// Add the server to the database
		database.updateServer(guild);
	},
};