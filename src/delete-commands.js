const { Client, Intents } = require('discord.js');
const { token, adminCommand } = require('../config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Runs when the client is ready
client.once('ready', async () => {
	// Delete all global commands
	await client.application.commands.set([]);

	// Gets the admin guild
	const guild = await client.guilds.fetch(adminCommand.guildId);
	// Deletes the admin command
	await guild.commands.set([]);

	// Logs when ready
	console.log('Deleted all application commands.');
	process.exit();
});

// Login to Discord with the bot's token
client.login(token);
