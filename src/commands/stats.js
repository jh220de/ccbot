const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription("Sends the bot's stats. ⚙️"),
    async execute(interaction) {
        const promises = [
            interaction.client.shard.fetchClientValues('guilds.cache.size'),
            interaction.client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];

        return Promise.all(promises)
            .then(results => {
                const servers = results[0].reduce((acc, guildCount) => acc + guildCount, 0)
                    .toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                const members = results[1].reduce((acc, memberCount) => acc + memberCount, 0)
                    .toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

                const embed = new MessageEmbed()
                    .setColor('00FFFF')
                    .setTitle("ClearChat-Bot Stats")
                    .setDescription(`
**Servers:** ${servers}
**Users:** ${members}
**Ping:** ${Math.round(interaction.client.ws.ping)}ms
**Shard:** ${interaction.guild.shardID}
                    `);
                    return interaction.reply({ embeds: [embed], ephemeral: true });
            });
    },
};