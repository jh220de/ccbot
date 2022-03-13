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
		const channelId = await interaction.customId.split(',')[1];
		const [rows] = await connection.execute('SELECT * FROM `channels` WHERE `channelId` = ?', [channelId]);

		const server = require('./server');
		const embed = await server.getEmbed(rows[0].serverId);
		const components = await server.getComponents(rows[0].serverId);
		return interaction.editReply({ embeds: [embed], components: components });
	},
	async getEmbed(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `channels` WHERE `channelId` = ?', [id]);
		const channel = rows[0];

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot User Information 📈')
			.setDescription(`
**Channel-ID:** ${channel.channelId}
**Server-ID:** ${channel.serverId}
**Channel-Name:** #${channel.channelName}${channel.channelTopic ? `
**Channel-Topic:** ${channel.channelTopic}` : ''}
			`);
		return embed;
	},
	async getComponents(id) {
		const row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('adminChannelServer,' + id)
				.setLabel('Show server')
				.setStyle('PRIMARY'),
		);
		return [row];
	},
};