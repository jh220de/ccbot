const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Send the bot\'s stats 📈'),
	async execute(interaction) {
		const connection = new (require('../mysql'))().getConnection();

		let [rows] = await connection.execute('SELECT COUNT(*) FROM `servers` WHERE `botLeave` IS NULL');
		const servers = rows[0]['COUNT(*)'];
		[rows] = await connection.execute('SELECT SUM(`memberCount`) FROM `servers`');
		const members = rows[0]['SUM(`memberCount`)'];
		[rows] = await connection.execute('SELECT COUNT(*) FROM `users`');
		const users = rows[0]['COUNT(*)'];

		let helpId;

		if (interaction.inGuild()) {
			[rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [interaction.guildId]);
			helpId = rows[0].helpId;
		}

		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Stats 📈')
			.setDescription(`
**Servers:** ${servers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}
**Members:** ${members.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}
**Users:** ${users.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}
**Ping:** ${Math.round(interaction.client.ws.ping)}ms
${interaction.inGuild() ? `
__**Server-Stats:**__
**Shard-ID:** ${interaction.guild.shardId}
**Help-ID:** ${helpId}
` : ''}
If you want to invite this bot to your server, you can do it [via the following link](https://jh220.de/ccbot).
*Note:* If you need help with the bot, [please visit our Discord](https://discord.gg/HW9tA4Mp3b).
This bot was created and is maintained by *[JH220#2155](https://jh220.de)*.
			`);
		interaction.editReply({ embeds: [embed] });
		return new (require('../mysql'))().reply(interaction, true, 'SENT_EMBED', null);
	},
};