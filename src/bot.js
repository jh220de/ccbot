const fs = require('fs');
const mysql = require('mysql2');

const { Client, Collection, Intents } = require('discord.js');
const { token, sql } = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const connection = mysql.createConnection({
    host: sql.host,
    port: sql.port,
    database: sql.database,
    user: sql.user,
    password: sql.password
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        const errorId = Math.floor(10000000 + Math.random() * 99999999);
        console.error(`
Error-ID: ${errorId}
Executed command: ${interaction.toString()} (${interaction.commandId}, ${interaction.applicationId})
Executed at: "${interaction.guild.name}" (${interaction.guildId}) in "#${interaction.channel.name}" (${interaction.channelId})
Executed by: ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})
Execute timestamp: ${Date.now()}`);
        if(!interaction.guild.me.permissions.has('MANAGE_GUILD')) return console.error('\n');
        await interaction.guild.invites.fetch().then(invites => console.error(invites.first() ? `Server invite: ${invites.first().code}\n` : '\n'));
        console.error(error);
        console.error();
        await interaction.reply({content: `
Hey, unfortunately an error occurred with the executed command.
Please report it to: https://github.com/JH220/discord-clearchatbot/issues/new?title=Error-ID%3A+${errorId}&template=command_error.md
Error-ID: ${errorId}
        `, ephemeral: true});
    }
});

var count = 1;
async function setActivity() {
    const promises = [
        client.shard.fetchClientValues('guilds.cache.size'),
        client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    ];

    return Promise.all(promises).then(results => {
        const servers = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
        const members = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

        var display = "jh220.de/ccbot";

        if (count == 1 || count == 2)
            display = `${servers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} servers`;
        else if (count == 3)
            display = `${(members - servers).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} members`;
        else count = 0;

        count++;
        client.user.setActivity(`/clear | ${display}`, { type: 'WATCHING' });
    });
}

client.on('ready', () => {
    setInterval(setActivity, 30000);

    connection.execute('CREATE TABLE IF NOT EXISTS `settings` (serverId VARCHAR(18), showreply TINYINT(1))');
    connection.execute('CREATE TABLE IF NOT EXISTS `autoclear` (serverId VARCHAR(18), showreply TINYINT(1))');
});

client.login(token);

module.exports = { connection };