import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('♻️ Clears the message history by a specified amount of messages and some additional filters.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false)
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('Number of messages to clear')
			.setMinValue(1)
			.setMaxValue(100),
		)
		.addUserOption(option => option.setName('user').setDescription('Filter messages from a specific user'))
		.addRoleOption(option => option.setName('role').setDescription('Filter messages from a specific role'))
		.addBooleanOption(option => option.setName('bot').setDescription('Filter messages sent by bots')),
	/** @param {import('discord.js').CommandInteraction} interaction */
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount') || 100;
		let fetched = await interaction.channel.messages.fetch({ limit: amount });
		fetched = fetched.filter(message => message.deletable);
		fetched = fetched.filter(message => !message.pinned);

		// Filter messages from a specific user if specified
		const user = interaction.options.getUser('user');
		if (user) fetched = fetched.filter(message => message.author.id == user.id);
		// Filter messages from a specific role if specified
		const role = interaction.options.getRole('role');
		if (role) fetched = fetched.filter(message => message.member && message.member.roles.cache.has(role));
		// Filter messages from bots if specified
		const bot = interaction.options.getBoolean('bot');
		if (bot) fetched = fetched.filter(message => message.member && message.member.user.bot);

		try {
			const messages = await interaction.channel.bulkDelete(fetched, true);
			await interaction.reply(`Successfully deleted ${messages.size} messages.`);
		}
		catch (error) {
			interaction.client.error(error);
			await interaction.reply({ content: 'There was an error while clearing messages\nPlease check if the bot has all the neccessary permissions!', ephemeral: true });
		}
	},
};