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
            return interaction.editReply("You do not have enough permissions to do this.");
        
        const { connection } = require('../bot');
        const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
        const result = rows[0];
        switch (interaction.options.getSubcommand()) {
            case 'show':
                const embed = new MessageEmbed()
                    .setColor('00FFFF')
                    .setTitle("ClearChat-Bot Settings page")
                    .addField('showreply',(result.showreply != 0).toString());
                return interaction.editReply({ embeds: [embed] });
            case 'showreply':
                const current = result.showreply != 0;
                const showreply = interaction.options.getBoolean('showreply');
                if(current == showreply) return interaction.editReply("Nothing changed.");
                await connection.execute('UPDATE `settings` SET `showreply` = ? WHERE `serverId` = ?', [showreply ? 1 : 0, interaction.guildId]);
                return interaction.editReply(`Showreply changed to ${showreply}.`);
        }
    },
};