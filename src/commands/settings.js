const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription("Server-specific settings of the bot ⚙️")
        .addSubcommand(subcommand => subcommand
            .setName('reply')
            .setDescription("Decides whether a reply is displayed to everyone when the chat history is successfully cleared.")
            .addBooleanOption(option => option.setName('showreply').setDescription("true/false").setRequired(false))
        ),
    async execute(interaction) {
        if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });

        const { connection } = require('../bot');

        switch (interaction.options.getSubcommand()) {
            case "reply":
                const showreply = interaction.options.getBoolean('showreply');
                const [rows, fields] = connection.execute(
                    'SELECT * FROM `settings_reply` WHERE `serverId` = ?',
                    [interaction.serverId]
                );
                console.log(rows);
                console.log(fields);
                if (showreply == null) console.log(1);
                return console.log("debug: " + showreply);
            default:
                const embed = new MessageEmbed()
                    .setColor('00FFFF')
                    .setTitle("ClearChat-Bot Settings page")
                    .setDescription("Under construction.");
                return interaction.reply({ embeds: [embed] });
        }
    },
};