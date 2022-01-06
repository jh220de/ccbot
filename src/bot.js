const fs = require('fs');
const mysql = require('mysql2/promise');

const { Client, Collection, Intents } = require('discord.js');
const { token, sql, adminCommand } = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var connection;
client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

var errors = new Map();
var disabledCommands = [];

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (!client.commands.has(commandName)) return;

    const { connection } = require('./bot');
    var [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
    if(!rows[0])
        await connection.execute('INSERT INTO `settings` values (?, ?)', [interaction.guildId, true]);

    if(disabledCommands.indexOf(commandName) !== -1) return interaction.reply("Unfortunately, this command has been disabled.\nPlease try again later.");
    
    try {
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        const errorId = Math.floor(1000000000 + Math.random() * 9999999999);
        var invite;
        if(interaction.guild.me.permissions.has('MANAGE_GUILD')) 
            await interaction.guild.invites.fetch().then(invites => invites.first() ? invite = invites.first().code : '');

        const errorMsg = `**Error-ID: ${errorId}**
Executed command: ${interaction.toString()} (${interaction.commandId}, ${interaction.applicationId})
Executed at: "${interaction.guild.name}" (${interaction.guildId}) in "#${interaction.channel.name}" (${interaction.channelId})
Executed by: ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) <@${interaction.user.id}>
Execute timestamp: ${Date.now()} <t:${Math.round(Date.now()/1000)}:R>${invite ? `\nServer invite:${invite}` : ''}
Error: ${error.stack}`
        const userMsg = `Hey, unfortunately an error occurred with the executed command.
Please report it to: https://github.com/JH220/discord-clearchatbot/issues/new?title=Error-ID%3A+${errorId}&template=command_error.md
Error-ID: **${errorId}**`

        console.error(errorMsg);
        errors.set(errorId, errorMsg)

        if(interaction.deferred || interaction.replied) interaction.editReply(userMsg);
        else interaction.reply({content: userMsg, ephemeral: true});
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

async function setupMySQL() {
    const connection = await mysql.createConnection({
        host: sql.host,
        port: sql.port,
        database: sql.database,
        user: sql.user,
        password: sql.password
    });
    module.exports = { connection, errors, disabledCommands };

    connection.execute('CREATE TABLE IF NOT EXISTS `servers` (serverId VARCHAR(18), showreply TINYINT(1))');
    connection.execute('CREATE TABLE IF NOT EXISTS `settings` (serverId VARCHAR(18), showreply TINYINT(1))');
    connection.execute('CREATE TABLE IF NOT EXISTS `autoclear` (serverId VARCHAR(18), showreply TINYINT(1))');
}
async function setPermissions() {
    if(!client.application?.owner) await client.application?.fetch();
    const command = await client.guilds.cache.get(adminCommand.serverId)?.commands.fetch(adminCommand.commandId);
    const permissions = [
        {
            id: adminCommand.ownerId,
            type: 'USER',
            permission: true,
        },
    ];
    await command.permissions.add({ permissions });
}

client.on('ready', () => {
    setInterval(setActivity, 30000);
    setupMySQL();
    setPermissions();
});

client.login(token);