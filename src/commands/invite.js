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
[Here's an invite link so you too can get this bot on your server!](https://discord.com/oauth2/authorize?client_id=787789079227006976&permissions=484416&redirect_uri=https%3A%2F%2Fwww.jh220.de&scope=bot%20applications.commands)
We are glad about any support.
            `);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
