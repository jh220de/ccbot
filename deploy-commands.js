const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { appId, token, adminCommand } = require('./config.json');

const commands = [];
const commandFiles = require('node:fs').readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.data.name == 'admin') continue;
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(appId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
rest.put(Routes.applicationGuildCommands(appId, adminCommand.serverId), { body: [require('./commands/admin').data.toJSON()] })
	.then(() => console.log('Successfully registered admin command.'))
	.catch(console.error);