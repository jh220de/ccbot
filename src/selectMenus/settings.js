module.exports = {
	id: 'toggleSetting',
	linkedCommand: 'settings',
	/** @param {import('discord.js').Interaction} interaction */
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();
		// Gets the database entry of the current server
		const settings = await database.getSettings(interaction.guild);

		// Toggles the selected setting
		const setting = interaction.values[0];
		await settings.update({ [setting]: !settings[setting] });

		// Update the interactions reply embed to the new settings
		interaction.editReply({ embeds: [ await require('../commands/settings').getEmbed(interaction.guild) ] });
		database.reply(interaction, 'TOGGLE_SETTING', { SETTING: setting, NEW_STATE: !settings[setting] }, false);
	},
};