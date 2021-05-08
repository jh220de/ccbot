const Discord = require('discord.js');

module.exports = {
    name: 'invite',
    description: "Sends the bot's invite link to put it on your own server. :sparkles:",
    usage: 'invite',
    execute(message, args) {
        var embed = new Discord.MessageEmbed()
            .setColor('00FFFF')
            .setTitle("ClearChat-Bot Invite")
            .setDescription(`
Here's an invite link so you too can get this bot on your server!
We are glad about any support.

https://www.jh220.de/ccbot
            `);
        message.reply(embed);
        member.reply("yeet");
    },
};