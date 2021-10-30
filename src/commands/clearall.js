const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearall')
        .setDescription("Clears ♻️ all message in a channel")
        .addChannelOption((channel) => channel.setName('channel').setDescription('Select a channel')),
  
    async execute(interaction) {
        if(!interaction.channel.permissionsFor(interaction.member).has("MANAGE_CHANNELS"))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });

        const channel = interaction.options.getUser('channel');

        try {
            // https://stackoverflow.com/questions/48228702/deleting-all-messages-in-discord-js-text-channel
            // Clears all messages from a channel by cloning channel and deleting old channel
            await channel.clone()
            await channel.delete()
        } catch(error) {
            return interaction.reply({ content: "There was an error! The bot has insufficient permissions in this channel: " + error, ephemeral: true });
        } 
    },
};
