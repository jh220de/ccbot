const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription("Sends the bot's invite link to put it on your own server. ✨"),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('00FFFF')
            .setTitle("ClearChat-Bot Invite")
            .setDescription(`
Here's an invite link so you too can get this bot on your server!
We are glad about any support.

https://www.jh220.de/ccbot

Statistics on the number of servers and users can be found via "/stats".
*Note:* If you need help with the bot, please visit our Discord: http://jh220.de/cc/help
            `);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};