const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearall')
        .setDescription("Clears ♻️ all messages in a channel"),
    async execute(interaction) {
        if (interaction.channel.type != 'GUILD_TEXT')
            return interaction.reply({ content: "You can use this command only in text channels on servers!", ephemeral: true });
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });
        
        if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "The bot has insufficient permissions to manage channels.", ephemeral: true });
        
        if(interaction.channel.partial) {
            if(!interaction.channel.parent.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
                return interaction.reply({ content: "The bot has insufficient permissions to manage channels.", ephemeral: true });
        } else if(!interaction.guild.me.permissions.has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "The bot has insufficient permissions to manage channels.", ephemeral: true });
        
        await interaction.deferReply();
        interaction.channel.delete();
        interaction.channel.clone().then(channel => {
            if(channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES'))
                return channel.send(`Deleted all messages in this channel by ${interaction.user}.`);
        });
    },
};