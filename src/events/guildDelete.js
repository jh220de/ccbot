module.exports = {
	name: 'guildDelete',
	async execute(guild) {
		// Returns if bot is not ready
		if (!(new (require('../database'))().getConnection())) return;

		// Gets the Server model from the current database connection
		const Server = new (require('../database'))().getConnection().models.Server;
		// Gets the database entry for the server
		const server = await Server.findOne({ where: { guildId: guild.id, botLeave: null } });

		// Returns if the server is null
		if (!server) return;
		// Updates the database entry of the server
		server.update({ botLeave: Date.now() });

		// Logs that the server was removed from the database
		console.log(`Removed ${server.serverId} from the database.`);
	},
};