module.exports = {
	async execute(interaction) {
		const { commandName } = interaction;
		if (!interaction.client.commands.has(commandName)) return;
		await interaction.deferReply({ ephemeral: true });

		const mysql = new (require('../../mysql'))();
		await mysql.updateOnInteraction(interaction);
		let [rows] = await mysql.getConnection().execute('SELECT * FROM `disabled_commands` WHERE `commandName` = ?', [commandName]);
		if (rows[0]) return mysql.reply(interaction, false, 'COMMAND_DISABLED', 'Unfortunately, this command has been disabled.\nPlease try again later.');
		[rows] = await mysql.getConnection().execute('SELECT * FROM `banned_servers` WHERE `serverId` = ?', [interaction.guildId]);
		if (rows[0]) return mysql.reply(interaction, false, 'SERVER_BANNED', 'Hey, this server is banned.\nIf you think you have not done anything wrong, you can go on [our discord](https://discord.gg/HW9tA4Mp3b).');
		[rows] = await mysql.getConnection().execute('SELECT * FROM `banned_users` WHERE `userId` = ?', [interaction.user.id]);
		if (rows[0]) return mysql.reply(interaction, false, 'USER_BANNED', 'Hey, you are banned.\nIf you think you have not done anything wrong, you can go on [our discord](https://discord.gg/HW9tA4Mp3b).');

		try {
			await interaction.client.commands.get(commandName).execute(interaction);
		}
		catch (error) {
			let errorId;
			while (await mysql.existsId(errorId)) errorId = Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000);
			const interactionId = interaction.id;

			mysql.getConnection().execute('INSERT INTO `errors` VALUES (?, ?, ?)', [errorId, interactionId, error.stack]);
			console.error(`Error ${errorId} at ${interactionId}:\n${error.stack}`);
			mysql.reply(interaction, false, 'ERROR', `Hey, unfortunately an error occurred while executing this command.\nPlease report it to: https://github.com/JH220/discord-clearchatbot/issues/new?title=Error-ID%3A+${errorId}&template=command_error.md\nError-ID: **${errorId}**`);
		}
	},
};