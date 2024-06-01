import { Events } from 'discord.js';

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			interaction.client.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		const database = new (require('../database'))();
		if (!database.getConnection()) return;
		const { models } = database.getConnection();

		database.addInteraction(interaction);

		const bannedUser = await models.UserBan.findOne({ where: { userId: interaction.user.id, pardonModId: null } });
		if (bannedUser) return database.reply(interaction, 'USER_BANNED', { 'REASON': bannedUser.reason, 'BAN_ID': bannedUser.banId });
		if (interaction.inGuild()) {
			const bannedGuild = await models.GuildBan.findOne({ where: { guildId: interaction.guildId, pardonModId: null } });
			if (bannedGuild) return database.reply(interaction, 'GUILD_BANNED', { 'REASON': bannedUser.reason, 'BAN_ID': bannedGuild.banId });
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			interaction.client.error(error);
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				}
				else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
			catch {
				interaction.client.error('Failed to deliver the error message to the user.');
			}
		}
	},
};