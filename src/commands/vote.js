const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('✨ Vote for this bot and get exclusive features!'),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		// Get the database connection
		const database = new (require('../database'))();

		interaction.editReply({ embeds: [ new MessageEmbed()
			.setColor('00FFFF')
			.setTitle('ClearChat-Bot Vote Infos ✨')
			.setDescription(await database.getMessage('VOTE_EMBED')),
		] });
		return new (require('../database'))().reply(interaction, 'VOTE_EMBED', null, false);
	},
};