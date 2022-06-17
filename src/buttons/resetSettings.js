module.exports = {
	id: 'resetSettings',
	linkedCommand: 'settings',
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();

		// Delets the database entry of the current server
		await (await database.getSettings(interaction.guild)).destroy();

		// Update the interactions reply embed to the new settings
		interaction.editReply({ embeds: [ await require('../commands/settings').getEmbed(interaction.guild) ] });
		database.reply(interaction, 'RESET_ALL_SETTINGS', null, false);
	},
};