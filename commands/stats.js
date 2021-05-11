const Discord = require('discord.js');

module.exports = {
    name: 'stats',
    description: "Sends the bot's stats. :gear:",
    usage: 'stats',
    execute(message, args) {
        var members = 0;
        message.client.guilds.cache.each(guild => members += guild.memberCount);

        var embed = new Discord.MessageEmbed()
            .setColor('00FFFF')
            .setTitle("ClearChat-Bot Stats")
            .setDescription(`
**Servers:** ${message.client.guilds.cache.size}
**Members:** ${members}
**Ping:** ${Math.round(message.client.ws.ping)}ms
            `);
        message.reply(embed);
    },
};