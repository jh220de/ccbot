const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Server-specific settings of the bot ⚙️'),
	async execute(interaction) {
		const mysql = new (require('../mysql'))();
		if (!interaction.channel.permissionsFor(interaction.member).has('ADMINISTRATOR'))
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		const selectMenu = new MessageActionRow().addComponents(new MessageSelectMenu()
			.setCustomId('settings')
			.setPlaceholder('Toggle a setting')
			.addOptions([
				{
					label: 'Toggle Show Reply',
					description: 'Specifies whether feedback is sent on /clear commands.',
					value: 'showreply',
				},
			]),
		);
		const button = new MessageActionRow().addComponents(new MessageButton()
			.setCustomId('resetSettings')
			.setLabel('Reset all settings')
			.setStyle('DANGER'),
		);
		interaction.editReply({ embeds: [await getEmbed(interaction.guildId)], components: [selectMenu, button] });
		return mysql.reply(interaction, true, 'SENT_EMBED', null);
	},
	selectMenuIds: ['settings'],
	async executeSelectMenu(interaction) {
		const connection = new (require('../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
		if (interaction.values[0] == 'showreply') {
			const showreply = !rows[0].showreply;
			await connection.execute('UPDATE `settings` SET `showreply` = ? WHERE `serverId` = ?', [showreply ? 1 : 0, interaction.guildId]);
		}
		const embed = await getEmbed(interaction.guildId);
		await interaction.editReply({ embeds: [embed] });
	},
	buttonIds: ['resetSettings'],
	async executeButton(interaction) {
		const mysql = new (require('../mysql'))();
		await mysql.getConnection().execute('DELETE FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
		await mysql.updateGuild(interaction.guild);
		const embed = await getEmbed(interaction.guildId);
		interaction.editReply({ embeds: [embed] });
	},
};

async function getEmbed(guildId) {
	const connection = new (require('../mysql'))().getConnection();
	const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [guildId]);
	const result = rows[0];

	const embed = new MessageEmbed()
		.setColor('00FFFF')
		.setTitle('ClearChat-Bot Settings ⚙️')
		.setDescription(`
This is the settings page of the ClearChat bot.
You can select a setting from the drop-down menu below this message and then enable or disable it.
The updated setting will immediately appear updated in the message, so you can make further adjustments.
To reset all settings to their default values, click "Reset all settings" there.
		`)
		.addField('Show Reply', result.showreply != 0 ? '<:tickYes:315009125694177281> ON' : '<:tickNo:315009174163685377> OFF');
	return embed;
}