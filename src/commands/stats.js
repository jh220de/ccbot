const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription("Sends the bot's stats 📈"),
    async execute(interaction) {
        const { connection } = require('../bot');
        var execCount = 0;
        var helpId;
        if(interaction.guild != null) {
            var [rows] = await connection.execute('SELECT `execCount` FROM `stats` WHERE `serverId` = ?', [interaction.guildId]);
            for(let i = 0; i < rows.length; i++) execCount += parseInt(rows[0].execCount);
            [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [interaction.guildId]);
            if(!rows[0]) return interaction.editReply("Please reenter the command.");
            helpId = rows[0].helpId;
        }

        const promises = [
            interaction.client.shard.fetchClientValues('guilds.cache.size'),
            interaction.client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];

        return Promise.all(promises).then(results => {
            const servers = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
            const members = results[1].reduce((acc, memberCount) => acc + memberCount, 0);

            const embed = new MessageEmbed()
                .setColor('00FFFF')
                .setTitle("ClearChat-Bot Stats")
                .setDescription(`
**Servers:** ${servers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
**Members:** ${(members - servers).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
**Ping:** ${Math.round(interaction.client.ws.ping)}ms
${interaction.guild != null ? `**Shard:** ${interaction.guild.shardId + 1}
**Help-ID:** ${helpId}${/***Total cleared messages on this server:** ${execCount}*/''}\n` : ''}
If you want to invite this bot to your server, you can do it via the following link: http://jh220.de/ccbot
*Note:* If you need help with the bot, please visit our Discord: http://jh220.de/cc/help
            `);
            return interaction.editReply({ embeds: [embed] });
        });
    },
};