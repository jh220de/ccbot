const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes, RESTJSONErrorCodes } = require('discord-api-types/v9');
const { token, appId, adminCommand } = require('../config.json');

var commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if(command.data.name != 'admin')
        commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(appId), { body: commands })
    .then(console.log('Successfully registered application commands.'))
    .catch(console.error);

const command = require('./commands/admin');
commands = [];
commands.push(command.data.toJSON());

rest.put(Routes.applicationGuildCommands(appId, adminCommand.serverId), { body: commands })
    .then(console.log('Successfully registered application guild command.'))
    .catch(console.error);