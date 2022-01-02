const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoclear')
        .setDescription("Clears the channel history after a certain amount of time")
        .addIntegerOption(option => option.setName('duration').setDescription("Specifies after what time the messages should be deleted"))
        .addStringOption(option => option
            .setName('mode')
            .setDescription("Specifies which messages are going to be deleted")
            .addChoice('All messages', 'all')
            .addChoice('Only messages from bots', 'bots')
            .addChoice('Only messages from webhooks', 'webhooks')
            .addChoice('Only messages from users', 'users')
        ),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('00FFFF')
            .setTitle("ClearChat-Bot Auto Clear")
            .setDescription("Under construction!");
        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
