const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		await interaction.reply(`Pong!\nShard ${interaction.guild.shardId + 1}: ${interaction.client.ws.ping}ms`);
	},
};