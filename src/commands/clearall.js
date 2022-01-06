const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearall')
        .setDescription("Clears ♻️ all messages in a channel"),
    async execute(interaction) {
        if (interaction.guild == null)
            return interaction.reply({ content: "You can use this command only on servers!", ephemeral: true });
        if (interaction.channel.type != 'GUILD_TEXT')
            return interaction.reply({ content: "You can use this command only in text channels on servers!", ephemeral: true });
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });
        
        if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "The bot has insufficient permissions to manage this channel.", ephemeral: true });
        
        if(interaction.channel.partial) {
            if(!interaction.channel.parent.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
                return interaction.reply({ content: "The bot has insufficient permissions to manage channels in this category.", ephemeral: true });
        } else if(!interaction.guild.me.permissions.has('MANAGE_CHANNELS'))
            return interaction.reply({ content: "The bot has insufficient permissions to manage channels.", ephemeral: true });
        
        await interaction.deferReply();
        const { connection } = require('../bot');
        const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guild.id]);
        var ephemeral = rows[0] ? rows[0].showreply == 0 : false;
        interaction.channel.delete();
        interaction.channel.clone().then(channel => {
            if(channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES'))
                if(!ephemeral) return channel.send(`Deleted all messages in this channel by ${interaction.user}.`);
        });
    },
};