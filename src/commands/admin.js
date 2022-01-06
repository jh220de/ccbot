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
            .setName('showerror')
            .setDescription("Shows an exception of a specified error ID.")
            .addIntegerOption(option => option.setName('id').setDescription("Enter the error ID of the user here.").setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('togglecommand')
            .setDescription("Disables or enables a selected command.")
            .addStringOption(option => option.setName('command').setDescription("Specify the command here.").setChoices(commands).setRequired(true))
        ),
    async execute(interaction) {
        const { adminCommand } = require('../../config.json');
        if(interaction.member.id != adminCommand.ownerId) return;
        
        switch (interaction.options.getSubcommand()) {
            case 'showerror':
                const errorId = interaction.options.getInteger('id');
                const { errors } = require('../bot');
                console.log(errors);
                const error = errors.get(errorId);

                if(!error) return interaction.reply({ content: "The specified error does not exist.", ephemeral: true});
                return interaction.reply(error);
            case 'togglecommand':
                const { disabledCommands } = require('../bot');
                const command = interaction.options.getString('command');
                const index = disabledCommands.indexOf(command);
                if(index !== -1) {
                    disabledCommands.splice(index, 1);
                    return interaction.reply(`The command ${command} was successfully enabled.`);
                } else {
                    disabledCommands.push(command);
                    return interaction.reply(`The command ${command} was successfully disabled.`);
                }
        }
    },
};
