const { SlashCommandBuilder } = require('@discordjs/builders');
const { adminCommand } = require('../config.json');

var commands = [];
const commandFiles = require('node:fs').readdirSync(__dirname).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	if (file == 'admin.js') continue;
	const command = require(`./${file}`).data.name;
	commands.push([command.charAt(0).toUpperCase() + command.slice(1), command]);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('This command is used for debug and is only enabled on the Development Network.')
		.setDefaultPermission(false)
		.addSubcommand(subcommand => subcommand
			.setName('get')
			.setDescription('Shows information about an ID.')
			.addStringOption(option => option.setName('id').setDescription('Enter interaction, error, server, help, channel or user ID here.').setRequired(true)),
		).addSubcommand(subcommand => subcommand
			.setName('toggle')
			.setDescription('Disables or enables a selected command.')
			.addStringOption(option => option.setName('command').setDescription('Specify the command here.').setChoices(commands).setRequired(true)),
		),
	async execute(interaction) {
		const mysql = new (require('../mysql'))();
		if (!interaction.member.roles.cache.has(adminCommand.roleId) && adminCommand.ownerId != interaction.user.id)
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		const connection = mysql.getConnection();
		switch (interaction.options.getSubcommand()) {
		case 'get': {
			const id = interaction.options.getString('id');

			let [rows] = await connection.execute('SELECT * FROM `servers` WHERE `helpId` = ?', [id]);
			if (rows[0]) return require('./admin/server').execute(interaction);
			[rows] = await connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [id]);
			if (rows[0]) return require('./admin/error').execute(interaction);
			[rows] = await connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [id]);
			if (rows[0]) return require('./admin/server').execute(interaction);
			[rows] = await connection.execute('SELECT * FROM `interactions` WHERE `interactionId` = ?', [id]);
			if (rows[0]) return require('./admin/interaction').execute(interaction);
			[rows] = await connection.execute('SELECT * FROM `users` WHERE `userId` = ?', [id]);
			if (rows[0]) return require('./admin/user').execute(interaction);
			[rows] = await connection.execute('SELECT * FROM `channels` WHERE `channelId` = ?', [id]);
			if (rows[0]) return require('./admin/channel').execute(interaction);

			return mysql.reply(interaction, false, 'INVALID_ID', 'Please enter a valid ID.');
		}
		case 'toggle': {
			const command = interaction.options.getString('command');
			const [rows] = await connection.execute('SELECT * FROM `disabled_commands` WHERE `commandName` = ?', [command.toLowerCase()]);

			if (!rows[0]) {
				await connection.execute('INSERT INTO `disabled_commands` VALUES (?)', [command.toLowerCase()]);
				return mysql.reply(interaction, true, 'DISABLED_COMMAND', `The command ${command} was successfully disabled.`);
			}
			else {
				await connection.execute('DELETE FROM `disabled_commands` WHERE `commandName` = ?', [command.toLowerCase()]);
				return mysql.reply(interaction, true, 'ENABLED_COMMAND', `The command ${command} was successfully enabled.`);
			}
		}
		}
	},
	buttonIds: [
		'adminServerErrors', 'adminServerSettings', 'adminServerBan',
		'adminInteractionServer', 'adminInteractionChannel', 'adminInteractionUser',
		'adminErrorInteraction',
		'adminUserServers',
		'adminChannelServer',
	],
	async executeButton(interaction) {
		const mysql = new (require('../mysql'))();
		if (!interaction.member.roles.cache.has(adminCommand.roleId) && adminCommand.ownerId != interaction.user.id)
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		switch (interaction.customId.split(',')[0]) {
		case 'adminServerErrors':
		case 'adminServerSettings':
		case 'adminServerBan':
			return require('./admin/server').executeButton(interaction);
		case 'adminInteractionServer':
		case 'adminInteractionChannel':
		case 'adminInteractionUser':
			return require('./admin/interaction').executeButton(interaction);
		case 'adminErrorInteraction':
			return require('./admin/error').executeButton(interaction);
		case 'adminUserServers':
			return require('./admin/user').executeButton(interaction);
		case 'adminChannelServer':
			return require('./admin/channel').executeButton(interaction);
		}
	},
};