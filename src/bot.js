const fs = require('fs');
const moment = require('moment');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
var usageCount = 0;

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;
    const { commandName } = interaction;
    if(!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(interaction);
        usageCount++;
    } catch (error) {
        await interaction.reply({ content: "Please make sure that the bot has enough permissions in your channel.", ephemeral: true });
	}
});

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
    setInterval(setActivity, 30000);
});

client.login(token);