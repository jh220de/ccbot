const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearall')
        .setDescription("Clears ♻️ all messages in a channel"),
    async execute(interaction) {
        if (interaction.guild == null)
            return interaction.reply({ content: "You can use this command only on servers!", ephemeral: true });
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });

            interaction.channel.clone().catch();
            interaction.channel.delete().catch();
    },
};