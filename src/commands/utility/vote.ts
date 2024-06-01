import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('✨ Vote for this bot and get exclusive features!'),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		interaction.reply({ embeds: [ new EmbedBuilder()
			.setColor('#00FFFF')
			.setTitle('ClearChat-Bot Vote Infos ✨')
			.setDescription(`
            Hey, you can vote via [this link](https://jh220.de/cc/vote).
            This will give you access to new cool features.
            
            If you want to invite the bot to your server, click on [this link](https://discord.com/oauth2/authorize?client_id=787789079227006976&permissions=484432&redirect_uri=https%3A%2F%2Fwww.jh220.de&scope=bot%20applications.commands).
            If you need help with the bot, please visit our [Discord support server](https://discord.gg/HW9tA4Mp3b).
            `),
		] });
	},
};