const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription("Server-specific settings of the bot ⚙️")
        .addSubcommand(subcommand => subcommand.setName('show').setDescription("Displays all options and their associated values."))
        .addSubcommand(subcommand => subcommand
            .setName('showreply')
            .setDescription("Decides whether a reply is displayed to everyone when the chat history is successfully cleared.")
            .addBooleanOption(option => option.setName('showreply').setDescription("True/False").setRequired(true))
        ),
    async execute(interaction) {
        if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });
        
        const { connection } = require('../bot');
        connection.execute(
            'SELECT * FROM `settings` WHERE `serverId` = ?',
            [interaction.guildId],
            function(err, results, fields) {
                if(!results[0])
                    connection.execute(
                        'INSERT INTO `settings` values (?, ?)',
                        [interaction.guildId, true]
                    );
            }
        );
        connection.execute(
            'SELECT * FROM `settings` WHERE `serverId` = ?',
            [interaction.guildId],
            function(err, results, fields) {
                const result = results[0];
                switch (interaction.options.getSubcommand()) {
                    case "show":
                        const embed = new MessageEmbed()
                            .setColor('00FFFF')
                            .setTitle("ClearChat-Bot Settings page")
                            .addField('showreply',(result.showreply == 1).toString());
                        return interaction.reply({ embeds: [embed] });
                    case "showreply":
                        const current = result.showreply == 1;
                        const showreply = interaction.options.getBoolean('showreply');
                        if(current == showreply) return interaction.reply({ content: "Nothing changed." });
                        connection.execute(
                            'UPDATE `settings` SET `showreply` = ? WHERE `serverId` = ?',
                            [showreply ? 1 : 0, interaction.guildId],
                            function(err, results, fields) {
                                return interaction.reply({ content: `Showreply changed to ${showreply}.` });
                            }
                        );
                }
            }
        );
    },
};