const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('../config.json');

// Reading command files
const commands = [];
const commandFiles = require('node:fs').readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Ignoring admin command here to register it only for the admin guild
	if (command.data.name == 'admin') continue;
	commands.push(command.data.toJSON());
}

// Create rest instance
const rest = new REST({ version: '9' }).setToken(token);

// Register global commands
rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);