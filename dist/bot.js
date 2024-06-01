"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const discord_js_1 = require("discord.js");
class CustomClient extends discord_js_1.Client {
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
const client = new CustomClient({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
client.commands = new discord_js_1.Collection();
const foldersPath = (0, node_path_1.join)(__dirname, 'commands');
const commandFolders = (0, node_fs_1.readdirSync)(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = (0, node_path_1.join)(foldersPath, folder);
    const commandFiles = (0, node_fs_1.readdirSync)(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = (0, node_path_1.join)(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            client.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const eventsPath = (0, node_path_1.join)(__dirname, 'events');
const eventFiles = (0, node_fs_1.readdirSync)(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = (0, node_path_1.join)(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.login(token);
