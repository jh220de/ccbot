const Sequelize = require('sequelize');

module.exports = class database {
	/**
	 * When called, it looks if the database class has already been created and if it has not yet been instantiated, it will be created.
	 * Otherwise the current database instance is simply returned.
	 * @returns Current database class instance
	 * @constructor
	 */
	constructor() {
		// Return the current database if already defined
		if (database.instance instanceof database) return database.instance;
		// Create a new database instance
		database.instance = this;
	}

	/**
	 * This method establishes the database connection and sets up the database models.
	 * @returns {Promise<import('sequelize').Sequelize>} Current database connection
	 */
	async setup() {
		// If instance already set up return existing connection
		if (this.connection) return this.connection;

		// Create a new connection with sequelize
		this.connection = new Sequelize(require('../config.json').database, { logging: false });

		// Reading model files and sync them with the database
		const modelFiles = require('node:fs').readdirSync('./src/models').filter(file => file.endsWith('.js'));
		for (const file of modelFiles) {
			const Model = require(`./models/${file}`);
			Model.init(this.connection);
			Model.sync();
		}

		// Returning the connection for further use
		return this.connection;
	}

	/**
	 * This method is used to update the current server of a guild.
	 * If the database entry does not exist yet, the server will be added, otherwise the values in the database entry will be updated.
	 * @param {import('discord.js').Guild} guild The guild object which server should be updated
	 * @returns {Promise<import('sequelize').Model>} Database entry of the updated server
	 */
	async updateServer(guild) {
		// Gets the server entry of a guild
		const Server = this.connection.models.Server;
		let server = await Server.findOne({ where: { guildId: guild.id, botLeave: null } });


		if (!server) {
			// Adds the server to the database
			await Server.create({
				serverId: await this.createId(Server, 'serverId'),
				guildId: guild.id,
				serverName: guild.name,
				serverPicture: guild.iconURL(),
				created: guild.createdTimestamp,
				shardId: guild.shardId + 1,
				invites: JSON.stringify(await getInvites(guild)),
				memberCount: guild.memberCount,
				ownerId: guild.ownerId,
				botJoin: guild.joinedTimestamp,
			});
			server = await Server.findOne({ where: { guildId: guild.id, botLeave: null } });

			// Logs that the server was added to the database
			console.log(`Added ${server.serverId} to the database.`);
		}
		// Update the database entry of the server
		else server.update({
			serverName: guild.name,
			serverPicture: guild.iconURL(),
			shardId: guild.shardId + 1,
			invites: JSON.stringify(await getInvites(guild)),
			memberCount: guild.memberCount,
			ownerId: guild.ownerId,
		});

		// Returns the database entry for further use
		return server;
	}
	/**
	 * This method is used to update a user.
	 * If the database entry does not exist yet, the user will be added, otherwise the values in the database entry will be updated.
	 * @param {import('discord.js').User} u The discord.js user object
	 * @returns {Promise<import('sequelize').Model>} Database entry of the specified user
	 */
	async updateUser(u) {
		// Searches for a user entry in the database
		const User = this.connection.models.User;
		let user = await User.findOne({ where: { userId: u.id } });

		if (!user) {
			// Adds the user to the database
			await User.create({
				userId: u.id,
				userName: u.username,
				userDiscriminator: u.discriminator,
				userPicture: u.displayAvatarURL(),
				created: u.createdTimestamp,
			});
			user = await User.findOne({ where: { userId: u.id } });
		}
		// Update the user entry
		else user.update({
			userName: u.username,
			userDiscriminator: u.discriminator,
			userPicture: u.displayAvatarURL(),
		});

		// Returns the database entry for further use
		return user;
	}

	/**
	 * Creates a database entry for an interaction and updates the server and user entry.
	 * @param {import('discord.js').Interaction} interaction The discord.js interaction object
	 * @returns {Promise<import('sequelize').Model>} Database entry of the interaction
	 * @see reply
	 */
	async addInteraction(interaction) {
		// Requires the interaction model to create the new database entry
		const Interaction = this.connection.models.Interaction;

		// Updates the user entry in the database
		await this.updateUser(interaction.user);

		// If interaction is in a guild the server entry will be updated and its serverId will be saved
		const serverId = interaction.inGuild() ? (await this.updateServer(interaction.guild)).serverId : null;
		// Return command name and args if command interaction otherwise save custom id
		const command = interaction.isCommand() || interaction.isMessageContextMenu() ? interaction.toString() : interaction.customId.split(',').toString();
		// Gets the channel name if one exists
		const channelName = interaction.channel.type == 'GUILD_TEXT' ? interaction.channel.name : null;

		// Creates a database entry for the interaction
		return await Interaction.create({
			interactionId: interaction.id,
			serverId: serverId,
			channelId: interaction.channelId,
			channelName: channelName,
			userId: interaction.user.id,
			command: command,
			result: 'WAITING_FOR_RESPONSE',
		});
	}

	/**
	 * This method is executed after the addInteraction method to update in the database the result of the interaction.
	 * Thereby only the result is stored by a key value, whereby the user receives only the formatted message through a message configuration.
	 * This message can also be personalized by specifying arguments, so that information such as user name or ID can also be included in the reply.
	 * @param {import('discord.js').Interaction} interaction The discord.js interaction object
	 * @param {string} result The return value that is stored in the database and output as a formatted message to the user
	 * @param {Array} [args=null] Possible arguments that can be specified to personalize the user's output
	 * @param {boolean} [reply=true] Determines if a reply should be sent to the user
	 * @returns {Promise<import('discord.js').Message>} The discord.js message object of the reply
	 * @see addInteraction
	 */
	async reply(interaction, result, args = null, reply = true) {
		// Update the result with the interaction database entry
		await this.connection.models.Interaction.update({ result: result, args: args ? JSON.stringify(args) : null }, { where: { interactionId: interaction.id } });

		// Returns if no reply should be sent
		if (!reply) return;
		// Replys to the defered interaction with replaced args
		return await interaction.editReply(await this.getMessage(result, interaction, args));
	}
	/**
	 * This method is used to get the message of a specific result.
	 * The arguments specified in the config are exchanged with the specified ones and further arguments are automatically replaced by the specified interaction.
	 * @param {string} key The return value that is stored in the database and output as a formatted message to the user
	 * @param {import('discord.js').Interaction} [interaction=null] The discord.js interaction object
	 * @param {Array} [args=null] Possible arguments that can be specified to personalize the user's output
	 * @returns {Promise<string>} The message formatted with the replaced arguments ready for further use
	 */
	async getMessage(key, interaction = null, args = null) {
		// Gets the message config
		const messages = require('../messages.json');

		// Checks if the key exists in the config and throws an error if not exists
		if (!Object.prototype.hasOwnProperty.call(messages, key)) throw 'INVALID_KEY';
		// Gets the reply message of the result from the json config
		let reply = require('../messages.json')[key];

		// Replaces specified args in the reply
		if (args) {
			for (const arg of Object.keys(args))
				reply = reply.replaceAll(`%${arg}%`, args[arg]);
		}

		// Checks if an interaction is specified
		if (interaction) {
			// Replace default placeholders
			reply = reply.replaceAll('%INTERACTION_ID%', interaction.id);
			if (interaction.channel) reply = reply.replaceAll('%CHANNEL_ID%', interaction.channelId).replaceAll('%CHANNEL_NAME%', interaction.channel.name);
			reply = reply.replaceAll('%USER_ID%', interaction.user.id).replaceAll('%USER_NAME%', `${interaction.user.name}#${interaction.user.discriminator}`);
			// Replace server placeholders
			if (interaction.inGuild()) {
				// Gets the server entry of a guild
				const Server = this.connection.models.Server;
				const server = await Server.findOne({ where: { guildId: interaction.guildId, botLeave: null } });

				reply = reply.replaceAll('%GUILD_ID%', server.guildId).replaceAll('%SHARD_ID%', server.shardId);
				reply = reply.replaceAll('%SERVER_ID%', server.serverId).replaceAll('%SERVER_NAME%', server.serverName);
			}
			// Replace command placeholders
			if (interaction.isCommand())
				reply = reply.replaceAll('%COMMAND_ID%', interaction.commandId).replaceAll('%COMMAND_NAME%', interaction.commandName);
		}

		// Returns the message string for further use
		return reply;
	}

	/**
	 * This method generates a 10 digit random number.
	 * By specifying the database, it also looks that this number is unique.
	 * @param {import('sequelize').Model} Model The sequelize model object
	 * @param {String} modelId The database column name of the generated id in the database
	 * @returns {Promise<number>} Generated 10 digit number
	 */
	async createId(Model, modelId) {
		let id;
		// Creates an ten digit random number and checks that the number is not already been used
		do {
			id = parseInt(Math.random().toFixed(10).replace('0.', ''));
		} while (await Model.findOne({ where: { [modelId]: id } }));

		// Returns the generated unique number
		return id;
	}
	/**
	 * This method returns the settings for a specified guild and creates a new entry if none exists.
	 * @param {import('discord.js').Guild} guild The discord.js guild object
	 * @returns {Promise<import('sequelize').Model>} Settings for the specified guild
	 */
	async getSettings(guild) {
		// Gets the server id from the specified guild
		await this.updateServer(guild);
		const { serverId } = await this.connection.models.Server.findOne({ where: { guildId: guild.id, botLeave: null } });
		// Looks for an database entry in server settings
		let settings = await this.connection.models.ServerSetting.findOne({ where: { serverId: serverId } });

		// Creates the database settings entry of the server if not exists
		if (!settings) {
			await this.connection.models.ServerSetting.create({
				serverId: serverId,
				showreply: false,
			});
			settings = await this.connection.models.ServerSetting.findOne({ where: { serverId: serverId } });
		}

		// Returns the settings entry of the guild
		return settings;
	}

	getConnection() {
		return this.connection;
	}
};

/** @param {import('discord.js').Guild} guild */
async function getInvites(guild) {
	const invites = [];
	// Returns if the bot has insufficient permissions
	if (!guild.me.permissions.has(require('discord.js').Permissions.FLAGS.MANAGE_GUILD)) return null;
	// Fetch all invites from the guild
	const fetchedInvites = await guild.invites.fetch();
	// Extract the invite code from the discordjs invite object
	fetchedInvites.forEach(invite => invites.push(invite.code));
	// Returns the invite array
	return invites;
}