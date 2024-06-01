"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const { clientId, token, adminServerId } = require('./config.json');
const commands = [];
const foldersPath = (0, node_path_1.join)(__dirname, 'commands');
const commandFolders = (0, node_fs_1.readdirSync)(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = (0, node_path_1.join)(foldersPath, folder);
    const commandFiles = (0, node_fs_1.readdirSync)(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = (0, node_path_1.join)(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            if (command.data.name == 'admin')
                continue;
            commands.push(command.data.toJSON());
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const rest = new discord_js_1.REST().setToken(token);
(async () => {
    try {
        console.log(`Refreshing ${commands.length} application (/) commands...`);
        const data = await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        console.log('Registering admin command...');
        await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, adminServerId), { body: [require('./commands/utility/admin').data.toJSON()] });
        console.log('Successfully registered admin command.');
    }
    catch (error) {
        console.error(error);
    }
})();
