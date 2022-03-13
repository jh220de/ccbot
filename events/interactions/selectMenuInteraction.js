const commands = [];
const commandFiles = require('node:fs').readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`../../commands/${file}`);
	if (command.data.name == 'admin') continue;
	commands.push(command);
}

module.exports = {
	async execute(interaction) {
		const customId = interaction.customId.split(',')[0];
		let command;
		interaction.client.commands.forEach(cmd => {
			if (!cmd.selectMenuIds) return;
			cmd.selectMenuIds.forEach(id => {
				if (customId == id) return command = cmd;
			});
		});
		if (!command) return;

		await interaction.deferUpdate();

		const mysql = new (require('../../mysql'))();
		let [rows] = await mysql.getConnection().execute('SELECT * FROM `disabled_commands` WHERE `commandName` = ?', [command.data.name]);
		if (rows[0]) return mysql.reply(interaction, false, 'COMMAND_DISABLED', 'Unfortunately, this command has been disabled.\nPlease try again later.');
		[rows] = await mysql.getConnection().execute('SELECT * FROM `banned_servers` WHERE `serverId` = ?', [interaction.guildId]);
		if (rows[0]) return mysql.reply(interaction, false, 'SERVER_BANNED', 'Hey, this server is banned.\nIf you think you have not done anything wrong, you can go on [our discord](https://discord.gg/HW9tA4Mp3b).');
		[rows] = await mysql.getConnection().execute('SELECT * FROM `banned_users` WHERE `userId` = ?', [interaction.user.id]);
		if (rows[0]) return mysql.reply(interaction, false, 'USER_BANNED', 'Hey, you are banned.\nIf you think you have not done anything wrong, you can go on [our discord](https://discord.gg/HW9tA4Mp3b).');

		await command.executeSelectMenu(interaction);
	},
};