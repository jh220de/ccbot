const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('../config.json');

const commands = [];

// Reading command files
const commandFiles = require('node:fs').readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Ignoring admin command here to register it only for the admin guild
	if (command.data.name == 'admin') continue;
	commands.push(command.data.toJSON());
}
// Reading context menu files
const contextMenuFiles = require('node:fs').readdirSync('./src/contextMenus').filter(file => file.endsWith('.js'));
for (const file of contextMenuFiles) {
	const contextMenu = require(`./contextMenus/${file}`);
	commands.push(contextMenu.data.toJSON());
}

// Create rest instance
const rest = new REST({ version: '9' }).setToken(token);

// Register global commands
rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);