const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

var commands = [];
for (const file of require('fs').readdirSync(__dirname).filter(file => file.endsWith('.js'))) {
    const name = file.substring(0, file.length - 3);
    if(name != 'admin')
        commands.push([ name.charAt(0).toUpperCase() + name.slice(1), name ]);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription("This command is used for debug and is only enabled on the Development Network.")
        .setDefaultPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('error')
            .setDescription("Shows an exception of a specified error ID.")
            .addIntegerOption(option => option.setName('id').setDescription("Enter the error ID of the user here.").setRequired(true))
        ).addSubcommand(subcommand => subcommand
            .setName('toggle')
            .setDescription("Disables or enables a selected command.")
            .addStringOption(option => option.setName('command').setDescription("Specify the command here.").setChoices(commands).setRequired(true))
        ).addSubcommand(subcommand => subcommand
            .setName('help')
            .setDescription("Shows information of a specified help ID.")
            .addStringOption(option => option.setName('id').setDescription("Enter the help ID of the server here.").setRequired(true))
        ).addSubcommand(subcommand => subcommand
            .setName('whitelist')
            .setDescription("Adds or removes a specific user from the Vote whitelist.")
            .addUserOption(option => option.setName('user').setDescription("Specify the user here.").setRequired(true))
        ),
    async execute(interaction) {
        const { adminCommand } = require('../../config.json');
        const { connection } = require ('../bot');
        var rows;
        var result;
        
        switch (interaction.options.getSubcommand()) {
            case 'error':
                const errorId = interaction.options.getInteger('id');
                [rows] = await connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [errorId]);
                result = rows[0];

                if(!result) return interaction.reply({ content: "The specified error does not exist.", ephemeral: true});
                
                return interaction.reply(`**Error-ID: ${errorId}**
Executed command: "${result.command}" (${result.commandId}, ${result.applicationId})
Executed at: "${result.serverName}" (${result.serverId}) in "#${result.channelName}" <#${result.channelId}>
Executed by: ${result.userName}#${result.userDiscriminator} (<@${result.userId}>)
Executed <t:${result.timestamp}:R>${result.inviteId != '' ? `\nServer invite: discord.gg/${result.inviteId}` : ''}
Error: ${result.error}`);
            case 'toggle':
                const command = interaction.options.getString('command');
                [rows] = await connection.execute('SELECT * FROM `disabledCommands` WHERE `commandName` = ?', [command]);
                
                if(rows[0]) {
                    await connection.execute('DELETE FROM `disabledCommands` WHERE `commandName` = ?', [command]);
                    return interaction.reply(`The command ${command} was successfully enabled.`);
                } else {
                    await connection.execute('INSERT INTO `disabledCommands` values (?)', [command]);
                    return interaction.reply(`The command ${command} was successfully disabled.`);
                }
            case 'help':
                const helpId = interaction.options.getString('id');
                [rows] = await connection.execute('SELECT * FROM `servers` WHERE `helpId` = ?', [helpId]);
                if(!rows[0]) {
                    [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [helpId]);
                    if(!rows[0])
                        return interaction.reply({ content: "The specified help page does not exist.", ephemeral: true});
                }

                result = rows[0];
                return interaction.reply(`**Help-ID: ${result.helpId}**
Server: "${result.serverName}" (${result.serverId})${result.inviteId != '' ? `\nServer invite: discord.gg/${result.inviteId}` : ''}
Owner: "${result.ownerName}" <@${result.ownerId}>
Joined Timestamp <t:${Math.round(result.joinedTimestamp/1000)}:R>
Latest command Timestamp <t:${result.latestCommandTimestamp}:R>`);
            case 'whitelist':
                const user = interaction.options.getUser('user');
                [rows] = await connection.execute('SELECT * FROM `votes_whitelisted` WHERE `userId` = ?', [user.id]);
                if(!rows[0]) {
                    await connection.execute('INSERT INTO `votes_whitelisted` values (?)', [user.id]);
                    return interaction.reply(`The user ${user} was whitelisted successfully.`);
                } else {
                    await connection.execute('DELETE FROM `votes_whitelisted` WHERE `userId` = ?', [user.id]);
                    return interaction.reply(`The user ${user} was removed from whitelist successfully.`);
                }
        }
    },
};
