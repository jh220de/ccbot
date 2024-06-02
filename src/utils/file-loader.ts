import { CustomClient } from '../bot';
import { Collection } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';


export default {
	loadCommands(client: CustomClient): void {
		client.commands = new Collection<string, any>();
		const foldersPath = join(__dirname, '../commands');
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
	},
	loadEvents(client: CustomClient): void {
		const eventsPath = join(__dirname, '../events');
		const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

		for (const file of eventFiles) {
			const filePath = join(eventsPath, file);
			const event = require(filePath);
			if (event.once) client.once(event.name, (...args) => event.execute(...args));
			else client.on(event.name, (...args) => event.execute(...args));
		}
	},
};