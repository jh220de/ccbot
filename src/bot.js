const start = Date.now();

const fs = require('fs');
const moment = require('moment');
const { Client, Collection, Intents } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { token } = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
var shardId;
var counting = 0;

client.commands = new Collection();
const commands = [];

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;
    const { commandName } = interaction;
    if(!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(interaction);
        counting++;
        console.log(`${counting.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} ${moment().format('DD.MM.YYYY HH:mm:ss')}`);
    } catch (error) {
        await interaction.reply({ content: "Please make sure that the bot has enough permissions in your channel.", ephemeral: true });
	}
});

process.on('message', message => {
    if(message.type == 'shardId') shardId = message.data.shardId;
});

const rest = new REST({ version: '9' }).setToken(token);
async function loadCommands() {
    try {
        console.log("Refreshing commands...");

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log("Refreshed commands.");

        const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        console.log(`Shard ${shardId} started! Startup process took ${time}ms.`);
    } catch(errror) {
        console.error(error);
    }
}

var count = 1;
async function setActivity() {
    var display = "jh220.de/ccbot";

    if(count == 1 || count == 2) {
        var servers;
        await client.shard.fetchClientValues('guilds.cache.size')
            .then(results => servers = results.reduce((acc, guildCount) => acc + guildCount, 0));
        servers = servers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        display = `${servers} servers`;
    } else if(count == 3) {
        var members;
        await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
            .then(results => members = results.reduce((acc, memberCount) => acc + memberCount, 0))
        members = members.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        display = `${members} users`;
    } else count = 0;

    count++;
    client.user.setActivity(`/clear | ${display}`, { type: 'WATCHING' });
}

client.on('ready', () => {
    setActivity();
    setInterval(setActivity, 15000);
    
    loadCommands();
});
client.once('disconnect', () => console.log(`Shard ${shardId} stopped!`));

client.login(token);