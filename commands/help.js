const Discord = require('discord.js');
const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    description: "Sends a detailed help of the ClearChat Bot commands.",
    usage: 'help',
    execute(message, args) {
        const { commands } = message.client;

        var embed = new Discord.MessageEmbed()
            .setColor('FFFF00')
            .setTitle("ClearChat Help")
            .setDescription("Detailed help of the ClearChat Bot commands.");
            commands.forEach(command => embed.addField(prefix + command.usage, command.description, false));
        message.reply(embed);
    },
};