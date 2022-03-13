const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('♻️ Clears the message history by a specified amount of messages')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to clear'))
		.addUserOption(option => option.setName('target').setDescription('Clear messages only from a specific user')),
	async execute(interaction) {
		const mysql = new (require('../mysql'))();
		if (interaction.guild == null || interaction.channel.type != 'GUILD_TEXT')
			return mysql.reply(interaction, false, 'GUILD_COMMAND', 'You can use this command only on servers!');
		if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_MESSAGES'))
			return mysql.reply(interaction, false, 'USER_INSUFFICIENT_PERMISSIONS', 'You do not have enough permissions to execute this command.');

		const permissions = interaction.channel.permissionsFor(interaction.guild.me);
		const [rows] = await mysql.getConnection().execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guildId]);
		const showreply = rows[0].showreply == 1;

		if (!permissions.has('VIEW_CHANNEL'))
			return mysql.reply(interaction, false, 'BOT_VIEW_PERMISSION', 'The bot has insufficient permissions to view this channel.');
		if (!permissions.has('READ_MESSAGE_HISTORY'))
			return mysql.reply(interaction, false, 'BOT_READ_MESSAGE_HISTORY', 'The bot has insufficient permissions to read channel history.');
		if (!permissions.has('MANAGE_MESSAGES'))
			return mysql.reply(interaction, false, 'BOT_MANAGE_MESSAGES', 'The bot has insufficient permissions to manage messages.');
		if (showreply && !permissions.has('SEND_MESSAGES'))
			return mysql.reply(interaction, false, 'BOT_SEND_MESSAGES', 'The bot has insufficient permissions to send messages.');

		let amount = interaction.options.getInteger('amount');
		if (!amount) amount = 100;
		const user = interaction.options.getUser('target');

		if (amount < 1 || amount > 100)
			return mysql.reply(interaction, false, 'AMOUNT_OUT_OF_RANGE', 'You need to input a number between 1 and 100.');

		const reply = await interaction.fetchReply();
		let fetched = await interaction.channel.messages.fetch({ limit: amount, before: reply.id });
		fetched = fetched.filter(message => !message.pinned);
		if (user) fetched = fetched.filter(message => message.author.id == user.id);

		const messages = await interaction.channel.bulkDelete(fetched, true);
		await mysql.reply(interaction, true, `CLEARED_${messages.size}_MESSAGES`, `Successfully deleted ${messages.size} message${messages.size != 1 ? 's' : ''}${user ? ` from ${user}` : ''}.`);
		if (showreply) interaction.followUp(`Deleted ${messages.size} message${messages.size != 1 ? 's' : ''} in this channel${user ? ` from ${user}` : ''} by <@${interaction.user.id}>.`);
	},
};