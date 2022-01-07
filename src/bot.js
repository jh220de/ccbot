const fs = require('fs');
const mysql = require('mysql2/promise');
const wait = require('util').promisify(setTimeout);

const { Client, Collection, Intents } = require('discord.js');
const { token, sql, adminCommand, delay } = require('../config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
var active = false;
var connection;
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if(!active) return;
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (!client.commands.has(commandName)) return;

    updateEntrys(interaction.guild);
    connection.execute('INSERT INTO `stats` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[
        interaction.id, interaction.commandId, interaction.guildId, interaction.channelId, interaction.channel.name, interaction.user.id,
        Math.round(Date.now()/1000), interaction.toString(), 0
    ]);
    [rows] = await connection.execute('SELECT * FROM `disabledCommands` WHERE `commandName` = ?', [commandName]);
    if(rows[0]) return interaction.reply("Unfortunately, this command has been disabled.\nPlease try again later.");
    
    try {
        await client.commands.get(commandName).execute(interaction);
    } catch (error) {
        var errorId;
        while(await existsErrorId(errorId)) errorId = parseInt((Math.floor(1000000000 + Math.random() * 9999999999) + '').substring(0, 10));
        
        var invite;
        if(interaction.guild.me.permissions.has('MANAGE_GUILD')) 
            await interaction.guild.invites.fetch().then(invites => invites.first() ? invite = invites.first().code : undefined);
        const timestamp = Math.round(Date.now()/1000);

        const errorMsg = `Error-ID: ${errorId}
Executed command: "${interaction.toString()}" (${interaction.commandId}, ${interaction.applicationId})
Executed at: "${interaction.guild.name}" (${interaction.guildId}) in "#${interaction.channel.name}" (${interaction.channelId})
Executed by: "${interaction.user.username}"#${interaction.user.discriminator} (${interaction.user.id})
Execute timestamp: ${timestamp}${invite ? `\nServer invite: ${invite}` : ''}
Error: ${error.stack}`
        const userMsg = `Hey, unfortunately an error occurred with the executed command.
Please report it to: https://github.com/JH220/discord-clearchatbot/issues/new?title=Error-ID%3A+${errorId}&template=command_error.md
Error-ID: **${errorId}**`

        console.error(errorMsg);
        if(interaction.deferred || interaction.replied) interaction.editReply(userMsg);
        else interaction.reply({content: userMsg, ephemeral: true});

        connection.execute(
            'INSERT INTO `errors` values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [errorId, interaction.toString(), interaction.commandId, interaction.applicationId, interaction.guild.name, interaction.guildId, interaction.channel.name
                ,interaction.channelId, interaction.user.username, interaction.user.discriminator, interaction.user.id, timestamp, invite ? invite : '', error.stack]
        );
    }
});
client.on('guildCreate', async guild => {
    if(!active) return;
    updateEntrys(guild);
});
client.on('guildDelete', async guild => {
    if(!active) return;
    connection.execute('DELETE FROM `servers` WHERE `serverId` = ?', [guild.id]);
    connection.execute('DELETE FROM `settings` WHERE `serverId` = ?', [guild.id]);
    connection.execute('DELETE FROM `errors` WHERE `serverId` = ?', [guild.id]);
    connection.execute('DELETE FROM `autoclear` WHERE `serverId` = ?', [guild.id]);
});

async function updateEntrys(guild) {
    var invite;
    if(guild.me.permissions.has('MANAGE_GUILD')) 
        await guild.invites.fetch().then(invites => invites.first() ? invite = invites.first().code : undefined);
    const timestamp = Math.round(Date.now()/1000);
    const owner = client.users.cache.get(guild.ownerId);
    const ownerName = owner.username + '#' + owner.discriminator;
    var members = [];
    guild.members.cache.each(member => members.push({id: member.id, name: member.username + '#' + member.discriminator}));

    var [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [guild.id]);
    if(!rows[0])
        connection.execute('INSERT INTO `settings` values (?, ?)', [guild.id, true]);
    [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [guild.id]);
    if(!rows[0]) {
        var helpId;
        while(await existsHelpId(helpId)) helpId = parseInt((Math.floor(1000000000 + Math.random() * 9999999999) + '').substring(0, 10));
        connection.execute(
            'INSERT INTO `servers` values (?, ?, ?, ?, ?, ?, ?, ?)',
            [helpId, guild.id, guild.name, invite ? invite : '', guild.ownerId, ownerName, guild.joinedTimestamp, timestamp]
        );
    } else connection.execute(
        'UPDATE `servers` SET `serverName` = ?, `inviteId` = ?, `ownerId` = ?, `ownerName` = ?, `latestCommandTimestamp` = ? WHERE `serverId` = ?',
        [guild.name, invite ? invite : '', guild.ownerId, ownerName, timestamp, guild.id]
    );
}
async function existsHelpId(helpId) {
    if(!helpId) return true;
    const [rows] = await connection.execute('SELECT * FROM `servers` WHERE `helpId` = ?', [helpId]);
    if(rows[0]) return true;
    else return false;
}
async function existsErrorId(errorId) {
    if(!errorId) return true;
    const [rows] = await connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [errorId]);
    if(rows[0]) return true;
    else return false;
}

async function setupMySQL() {
    connection = await mysql.createConnection({
        host: sql.host,
        port: sql.port,
        database: sql.database,
        user: sql.user,
        password: sql.password
    });
    module.exports = { connection };

    connection.execute('CREATE TABLE IF NOT EXISTS `servers` (helpId VARCHAR(10), serverId VARCHAR(18), serverName VARCHAR(100), inviteId VARCHAR(10), ownerId VARCHAR(18), ownerName VARCHAR(100), joinedTimestamp VARCHAR(16), latestCommandTimestamp VARCHAR(16), shardId VARCHAR(4))');
    connection.execute('CREATE TABLE IF NOT EXISTS `settings` (serverId VARCHAR(18), showreply TINYINT(1))');
    connection.execute('CREATE TABLE IF NOT EXISTS `errors` (errorId VARCHAR(10), command VARCHAR(100), commandId VARCHAR(18), applicationId VARCHAR(18), serverName VARCHAR(100), serverId VARCHAR(18), channelName VARCHAR(100), channelId VARCHAR(18), userName VARCHAR(100), userDiscriminator VARCHAR(4), userId VARCHAR(18), timestamp VARCHAR(16), inviteId VARCHAR(10), error VARCHAR(1000))');
    connection.execute('CREATE TABLE IF NOT EXISTS `votes` (userId VARCHAR(18), voteTimestamp VARCHAR(16))');
    connection.execute('CREATE TABLE IF NOT EXISTS `votes_whitelisted` (userId VARCHAR(18))');
    connection.execute('CREATE TABLE IF NOT EXISTS `disabledCommands` (commandName VARCHAR(20))');
    connection.execute('CREATE TABLE IF NOT EXISTS `stats` (interactionId VARCHAR(18), commandId VARCHAR(18), serverId VARCHAR(18), channelId VARCHAR(18), channelName VARCHAR(100), userId VARCHAR(18), timestamp VARCHAR(16), command VARCHAR(100), execCount VARCHAR(8))');
    //connection.execute('CREATE TABLE IF NOT EXISTS `autoclear` (serverId VARCHAR(18), channelId VARCHAR(18), mode VARCHAR(10))');
}

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

async function setPermissions() {
    if(!client.application?.owner) await client.application?.fetch();
    if(!client.guilds.cache.get(adminCommand.serverId)) return;
    const command = await client.guilds.cache.get(adminCommand.serverId)?.commands.fetch(adminCommand.commandId);
    const permissions = [
        {
            id: adminCommand.ownerId,
            type: 'USER',
            permission: true,
        },
        {
            id: adminCommand.roleId,
            type: 'ROLE',
            permission: true,
        },
    ];
    await command.permissions.add({ permissions });
}

client.once('ready', () => {
    setupMySQL();
    setPermissions();
});
client.once('shardReady', () => {
    await wait(delay);
    active = true;
    setInterval(setActivity, 30000);
});

client.login(token);