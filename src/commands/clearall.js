const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearall')
        .setDescription("Clears ♻️ all messages in a channel"),
    async execute(interaction) {
        if (interaction.guild == null)
            return interaction.editReply("You can use this command only on servers!");
        if (interaction.channel.type != 'GUILD_TEXT')
            return interaction.editReply("You can use this command only in text channels on servers!");
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_CHANNELS'))
            return interaction.editReply("You do not have enough permissions to do this.");
        
        if (interaction.guild.rulesChannelId == interaction.channel.id)
            return interaction.editReply("Since this channel has been set as a rules channel, this channel cannot be deleted.");
        if (interaction.guild.publicUpdatesChannelId == interaction.channel.id)
            return interaction.editReply("Since this channel has been set as a community updates channel, this channel cannot be deleted.");
        
        if (!interaction.channel.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
            return interaction.editReply("The bot has insufficient permissions to manage this channel.");
        
        if(interaction.channel.partial) {
            if(!interaction.channel.parent.permissionsFor(interaction.guild.me).has('MANAGE_CHANNELS'))
                return interaction.editReply("The bot has insufficient permissions to manage channels in this category.");
        } else if(!interaction.guild.me.permissions.has('MANAGE_CHANNELS'))
            return interaction.editReply("The bot has insufficient permissions to manage channels.");
        
        const { connection } = require('../bot');
        const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guild.id]);
        const showreply = rows[0] ? rows[0].showreply == 1 : false;
        interaction.channel.delete();
        interaction.channel.clone().then(channel => {
            if(channel.permissionsFor(interaction.guild.me).has('SEND_MESSAGES') && showreply)
                channel.send(`Deleted all messages in this channel by ${interaction.user}.`);
        });
        connection.execute('UPDATE `stats` SET `execCount` = ? WHERE `interactionId` = ?', [100, interaction.id]);
    },
};