const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearall')
		.setDescription('♻️ Clears all messages in a channel')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setDMPermission(false),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		if (interaction.channel.type !== ChannelType.GuildText) return await interaction.reply({ content: 'This command can only be used in a server text channel.', ephemeral: true });

		var channel;

		try {
			channel = await interaction.channel.clone();
			await interaction.channel.delete();
		}
		catch (error) {
			console.error(error);
			return await interaction.reply({ content: 'There was an error while clearing this channel\nPlease check if the bot has all the neccessary permissions!', ephemeral: true });
		}

		await interaction.reply({ content: 'Deleting channel...', ephemeral: true });
		await channel.send(`<@${interaction.user.id}> deleted all messages in this channel.`);
	},
};