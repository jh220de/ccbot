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
		const interactionId = await interaction.customId.split(',')[1];
		const [rows] = await connection.execute('SELECT * FROM `interactions` WHERE `interactionId` = ?', [interactionId]);

		switch (interaction.customId.split(',')[0]) {
		case 'adminInteractionServer': {
			const server = require('./server');
			const embed = await server.getEmbed(rows[0].serverId);
			const components = await server.getComponents(rows[0].serverId);
			return interaction.editReply({ embeds: [embed], components: components });
		}
		case 'adminInteractionChannel': {
			const server = require('./channel');
			const embed = await server.getEmbed(rows[0].channelId);
			const components = await server.getComponents(rows[0].channelId);
			return interaction.editReply({ embeds: [embed], components: components });
		}
		case 'adminInteractionUser': {
			const server = require('./user');
			const embed = await server.getEmbed(rows[0].userId);
			const components = await server.getComponents(rows[0].userId);
			return interaction.editReply({ embeds: [embed], components: components });
		}
		}
	},
	async getEmbed(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `interactions` WHERE `interactionId` = ?', [id]);
		const interaction = rows[0];

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Interaction Information 📈')
			.setDescription(`
**Interaction-ID:** ${interaction.interactionId}
**Server-ID:** ${interaction.serverId}
**Channel-ID:** ${interaction.channelId}
**User-ID:** ${interaction.userId}

**Executed** <t:${interaction.time}:R>
**Command-Name:** ${interaction.commandName}
**Full command:** ${interaction.commandArgs}

**Successful:** ${interaction.successful ? '<:tickYes:315009125694177281>' : '<:tickNo:315009174163685377>'}
**Result:** ${interaction.result}
			`);
		return embed;
	},
	async getComponents(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const [rows] = await connection.execute('SELECT * FROM `errors` WHERE `interactionId` = ?', [id]);

		let row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('adminInteractionServer,' + id)
				.setLabel('Show server')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('adminInteractionChannel,' + id)
				.setLabel('Show channel')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('adminInteractionUser,' + id)
				.setLabel('Show user')
				.setStyle('PRIMARY'),
		);
		if (rows[0]) row = row.addComponents(new MessageButton()
			.setCustomId('adminInteractionError,' + id)
			.setLabel('Show error')
			.setStyle('DANGER'));

		return [row];
	},
};