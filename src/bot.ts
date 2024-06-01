import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';

class CustomClient extends Client {
	commands: Collection<string, any>;

	log(message) {
		this._sendLog('info', message);
	}
	warn(message) {
		this._sendLog('warn', message);
	}
	debug(message) {
		this._sendLog('debug', message);
	}

	_sendLog(level, message) {
		this.shard.send({ type: 'log', level: level, log: message });
	}
}


const { token } = require('../config.json');

const client: CustomClient = new CustomClient({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection<string, any>();
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			client.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

