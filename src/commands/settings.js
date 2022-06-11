const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('⚙️ Server-specific settings of the bot')
		.setDefaultMemberPermissions(Permissions.FLAGS.MANAGE_GUILD)
		.setDMPermission(false),
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();

		interaction.editReply({ embeds: [ await this.getEmbed(interaction.guildId) ], components: await this.getComponents() });
		database.reply(interaction, 'SETTINGS_EMBED', null, false);
	},
	async getEmbed(guildId) {
		// Get the settings for the specified guild id
		const settings = await new (require('../database'))().getSettings(guildId);

		// Returns the embed for the guild
		return new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Settings ⚙️')
			.setDescription(await new (require('../database'))().getMessage('SETTINGS_EMBED'))
			.addField('Show Reply', settings.showreply ? '<:tickYes:315009125694177281> ON' : '<:tickNo:315009174163685377> OFF');
	},
	async getComponents() {
		// Returns the toggle menu and reset button components
		return [new MessageActionRow().addComponents(new MessageSelectMenu()
			.setCustomId('toggleSetting')
			.setPlaceholder('Toggle a setting')
			.addOptions([
				{
					label: 'Toggle Show Reply',
					description: 'Specifies whether feedback is sent on /clear commands.',
					value: 'showreply',
				},
			]),
		), new MessageActionRow().addComponents(new MessageButton()
			.setCustomId('resetSettings')
			.setLabel('Reset All settings')
			.setStyle('DANGER'),
		)];
	},
};