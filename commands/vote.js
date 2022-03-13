const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Vote for this bot and get exclusive features! ✨'),
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Invite Infos ✨')
			.setDescription(`
Hey, you can vote at the following link:
https://jh220.de/cc/vote
This will give you access to the /autoclear command and allow you to define a channel as an autoclear channel.
			`);
		interaction.editReply({ embeds: [embed] });
		return new (require('../mysql'))().reply(interaction, true, 'SENT_EMBED', null);
	},
};