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
		const guild = await getServer(interaction.customId.split(',')[1]);
		const serverId = guild.serverId;

		switch (interaction.customId.split(',')[0]) {
		case 'adminServerErrors': {
			return;
		}
		case 'adminServerSettings': {
			return;
		}
		case 'adminServerBan': {
			const [rows] = await connection.execute('SELECT * FROM `banned_servers` WHERE `serverId` = ?', [serverId]);
			if (!rows[0]) await connection.execute('INSERT INTO `banned_servers` VALUES (?)', [serverId]);
			else await connection.execute('DELETE FROM `banned_servers` WHERE `serverId` = ?', [serverId]);

			const embed = await this.getEmbed(serverId);
			const components = await this.getComponents(serverId);
			return interaction.editReply({ embeds: [embed], components: components });
		}
		}
	},
	async getEmbed(id) {
		const mysql = new (require('../../mysql'))();
		const connection = mysql.getConnection();
		const result = await getServer(id);

		let [rows] = await connection.execute('SELECT * FROM `users` WHERE `userId` = ?', [result.ownerId]);
		const owner = rows[0];
		[rows] = await connection.execute('SELECT * FROM `interactions` WHERE `serverId` = ? ORDER BY `time` DESC LIMIT 1', [result.serverId]);
		const lastInteraction = rows[0];
		[rows] = await connection.execute('SELECT * FROM `autoclear` WHERE `serverId` = ?', [result.serverId]);
		const autoclears = rows.length;
		[rows] = await connection.execute('SELECT * FROM `banned_servers` WHERE `serverId` = ?', [result.serverId]);
		const banned = rows[0];

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Server Information 📈')
			.setThumbnail(result.serverPicture)
			.setDescription(`
**Server-Name:** ${result.serverName}
**Server-ID:** ${result.serverId}
**Banned** ${banned ? '<:tickYes:315009125694177281>' : '<:tickNo:315009174163685377>'}
**Help-ID:** ${result.helpId}
**Shard-ID:** ${result.shardId}${result.inviteId != '' ? `
**Invite:** ` + result.inviteId : ''}
**Members:** ${result.memberCount} members
**AutoClear count:** ${autoclears} channel${autoclears != 1 ? 's' : ''}
**Owner:** [${owner.userName}#${owner.userDiscriminator}](${owner.userProfilePicture}) (<@${result.ownerId}>)

**Server created** <t:${result.created}:R>
**Bot joined** <t:${result.botJoin}:R>${result.botLeave != '' ? `
**Bot left** <t:${result.botLeave}:R>` : ''}
**Owner account created** <t:${owner.created}:R>
**Last command** <t:${lastInteraction.time}:R>
			`);
		return embed;
	},
	async getComponents(id) {
		const connection = new (require('../../mysql'))().getConnection();
		const result = await getServer(id);
		const [rows] = await connection.execute('SELECT * FROM `banned_servers` WHERE `serverId` = ?', [result.serverId]);

		let row = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('adminServerErrors,' + result.serverId)
				.setLabel('Show errors')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('adminServerSettings,' + result.serverId)
				.setLabel('Show settings')
				.setStyle('PRIMARY'),
		);
		if (require('../../config.json').adminCommand.serverId != result.serverId) {
			row = row.addComponents(new MessageButton()
				.setCustomId('adminServerBan,' + result.serverId)
				.setLabel(!rows[0] ? 'Ban server' : 'Unban server')
				.setStyle('DANGER'));
		}
		return [row];
	},
};

async function getServer(id) {
	const connection = new (require('../../mysql'))().getConnection();
	let [rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [id]);
	if (!rows[0]) [rows] = await connection.execute('SELECT * FROM `servers` WHERE `helpId` = ?', [id]);
	return rows[0];
}