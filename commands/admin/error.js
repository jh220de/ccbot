const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	async execute(interaction) {
		const id = interaction.options.getString('id');
		const embed = await this.getEmbed(id);
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('adminErrorInteraction,' + id)
				.setLabel('Show interaction')
				.setStyle('PRIMARY'),
		);
		interaction.editReply({ embeds: [embed], components: [row] });
		return new (require('../../mysql'))().reply(interaction, true, 'SENT_EMBED', null);
	},
	async executeButton(interaction) {
		const connection = new (require('../../mysql'))().getConnection();
		const errorId = await interaction.customId.split(',')[1];
		const [rows] = await connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [errorId]);
		const interactionId = rows[0].interactionId;

		const action = require('./interaction');
		const embed = await action.getEmbed(interactionId);
		const components = await action.getComponents(interactionId);
		interaction.editReply({ embeds: [embed], components: components });
	},
	async getEmbed(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [id]);
		const error = rows[0];

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Error Information 📈')
			.setDescription(`
**Error-ID:** ${error.errorId}
**Interaction-ID:** ${error.interactionId}

**Error: ${error.error}
			`);
		return embed;
	},
};