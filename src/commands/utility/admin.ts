import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('This command is used for debug and is only enabled on this server.')
		.setDefaultMemberPermissions('0')
		.setDMPermission(false)
		.addSubcommand(subcommand => subcommand
			.setName('get')
			.setDescription('Shows information about an ID.')
			.addStringOption(option => option.setName('id').setDescription('Enter an interaction, server, guild, user or ban ID here.').setRequired(true)),
		),
	async execute(interaction) {
		const database = new (require('../database'))();
		const { models } = database.getConnection();

		switch (interaction.options.getSubcommand()) {
		case 'get': {
			const id = interaction.options.getString('id');

			let entry = await models.AutoClear.findOne({ where: { channelId: id } });
			if (entry) return require('./admin/get/autoclear').execute(interaction, entry);

			entry = await models.GuildBan.findOne({ where: { banId: id } });
			if (entry) return require('./admin/get/guildban').execute(interaction, entry);

			entry = await models.Interaction.findOne({ where: { interactionId: id } });
			if (entry) return require('./admin/get/interaction').execute(interaction, entry);

			entry = await models.Server.findOne({ where: { serverId: id } });
			if (entry) return require('./admin/get/server').execute(interaction, entry);

			entry = await models.Server.findAll({ where: { guildId: id, botLeave: null } });
			if (entry) return require('./admin/get/guild').execute(interaction, entry);

			entry = await models.User.findOne({ where: { userId: id } });
			if (entry) return require('./admin/get/user').execute(interaction, entry);

			entry = await models.UserBan.findOne({ where: { banId: id } });
			if (entry) return require('./admin/get/userban.js').execute(interaction, entry);

			return database.reply(interaction, 'INVALID_ID');
		}
		case 'stats': return require('./admin/stats').execute(interaction);
		case 'log': return require('./admin/log.js').execute(interaction);
		case 'list': return require('./admin/list.js').execute(interaction);
		}
	},
};