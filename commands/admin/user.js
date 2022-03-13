const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	async execute(interaction) {
		const id = interaction.options.getString('id');
		const embed = await this.getEmbed(id);
		const components = await this.getComponents(id);
		interaction.editReply({ embeds: [embed], components: components });
		return new (require('../../mysql'))().reply(interaction, true, 'SENT_EMBED', null);
	},
	async executeButton(interaction) {
		const connection = new (require('../../mysql'))().getConnection();
		const userId = await interaction.customId.split(',')[1];
		const [rows] = await connection.execute('SELECT * FROM `users` WHERE `userId` = ?', [userId]);

		// TODO
		rows;
	},
	async getEmbed(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `users` WHERE `userId` = ?', [id]);
		const user = rows[0];

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot User Information 📈')
			.setThumbnail(user.userProfilePicture)
			.setDescription(`
**User-ID:** ${user.userId}
**User-Name:** ${user.userName}#${user.userDiscriminator}
**Created** <t:${user.created}:R>
			`);
		return embed;
	},
	async getComponents(id) {
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('adminUserServers,' + id)
				.setLabel('Show servers')
				.setStyle('PRIMARY'),
		);
		return [row];
	},
};