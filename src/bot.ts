import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Logger } from './utils/logger';

export class CustomClient extends Client implements Logger {
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
	error(message) {
		this._sendLog('error', message);
	}
	trace(message) {
		this._sendLog('trace', message);
	}

	_sendLog(level, message) {
		this.shard.send({ type: 'log', level: level, log: message });
	}
}

const client: CustomClient = new CustomClient({ intents: [GatewayIntentBits.Guilds] });

import fileLoader from './utils/file-loader';
fileLoader.loadCommands(client);
fileLoader.loadEvents(client);

const token : string = require('../config.json').token;
client.login(token);