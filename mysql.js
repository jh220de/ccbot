class mysql {
	constructor() {
		if (mysql.instance instanceof mysql) {
			return mysql.instance;
		}

		mysql.instance = this;
	}

	async setup() {
		const { sql } = require('./config.json');
		this.connection = await require('mysql2/promise').createConnection({
			host: sql.host,
			port: sql.port,
			database: sql.database,
			user: sql.user,
			password: sql.password,
		});

		this.connection.execute('CREATE TABLE IF NOT EXISTS `interactions` (interactionId VARCHAR(18), serverId VARCHAR(18), channelId VARCHAR(18), userId VARCHAR(18), time VARCHAR(16), commandName VARCHAR(20), commandArgs VARCHAR(100), successful TINYINT(1), result VARCHAR(1000))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `errors` (errorId VARCHAR(10), interactionId VARCHAR(18), error VARCHAR(1000))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `servers` (serverId VARCHAR(18), serverName VARCHAR(100), shardId INT, helpId VARCHAR(10), inviteId VARCHAR(10), memberCount INT, ownerId VARCHAR(18), created VARCHAR(16), serverPicture VARCHAR(100), botJoin VARCHAR(16), botLeave VARCHAR(16))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `settings` (serverId VARCHAR(18), showreply TINYINT(1))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `channels` (channelId VARCHAR(18), serverId VARCHAR(18), channelName VARCHAR(100), channelTopic VARCHAR(1024))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `autoclear` (channelId VARCHAR(18), serverId VARCHAR(18), creatorId VARCHAR(18), duration INT, mode VARCHAR(20))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `users` (userId VARCHAR(18), userName VARCHAR(100), userDiscriminator VARCHAR(4), userProfilePicture VARCHAR(100), created VARCHAR(16))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `members` (userId VARCHAR(18), serverId VARCHAR(18), memberNickname VARCHAR(100))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `votes` (userId VARCHAR(18), time VARCHAR(16))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `vote_whitelist` (userId VARCHAR(18))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `disabled_commands` (commandName VARCHAR(20))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `banned_servers` (serverId VARCHAR(18))');
		this.connection.execute('CREATE TABLE IF NOT EXISTS `banned_users` (userId VARCHAR(18))');
	}

	async updateGuild(guild) {
		const serverId = guild.id;
		const serverName = guild.name;
		const shardId = guild.shardId + 1;
		let inviteId = '';
		if (guild.me.permissions.has('MANAGE_GUILD'))
			await guild.invites.fetch().then(invites => invites.first() ? inviteId = invites.first().code : '');
		const memberCount = guild.memberCount;
		const ownerId = guild.ownerId;
		const serverPicture = guild.iconURL();

		let [rows] = await this.connection.execute('SELECT * FROM `servers` WHERE `serverId` = ?', [serverId]);
		if (!rows[0]) {
			let helpId;
			while (await this.existsId(helpId)) helpId = Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000);
			const created = Math.round(guild.createdTimestamp / 1000);
			const botJoin = Math.round(guild.joinedTimestamp / 1000);

			await this.connection.execute('INSERT INTO `servers` values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [serverId, serverName, shardId, helpId, inviteId, memberCount, ownerId, created, serverPicture, botJoin, '']);
		}
		else await this.connection.execute('UPDATE `servers` SET `serverName` = ?, `shardId` = ?, `inviteId` = ?, `memberCount` = ?, `ownerId` = ?, `serverPicture` = ? WHERE `serverId` = ?', [serverName, shardId, inviteId, memberCount, ownerId, serverPicture, serverId]);

		await this.updateMember(await guild.fetchOwner());
		[rows] = await this.connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [serverId]);
		if (!rows[0]) await this.connection.execute('INSERT INTO `settings` values (?, ?)', [serverId, true]);
	}
	async updateUser(user) {
		const userId = user.id;
		const userName = user.username;
		const userDiscriminator = user.discriminator;
		const userProfilePicture = user.displayAvatarURL();

		const [rows] = await this.connection.execute('SELECT * FROM `users` WHERE `userId` = ?', [userId]);
		if (!rows[0]) {
			const created = Math.round(user.createdTimestamp / 1000);
			await this.connection.execute('INSERT INTO `users` values (?, ?, ?, ?, ?)', [userId, userName, userDiscriminator, userProfilePicture, created]);
		}
		else await this.connection.execute('UPDATE `users` SET `userName` = ?, `userDiscriminator` = ?,  `userProfilePicture` = ? WHERE `userId` = ?', [userName, userDiscriminator, userProfilePicture, userId]);
	}
	async updateMember(member) {
		this.updateUser(member.user);

		const userId = member.id;
		const memberNickname = member.nickname;

		const [rows] = await this.connection.execute('SELECT * FROM `members` WHERE `userId` = ?', [userId]);
		if (!rows[0]) {
			const serverId = member.guild.id;

			await this.connection.execute('INSERT INTO `members` values (?, ?, ?)', [userId, serverId, memberNickname]);
		}
		else await this.connection.execute('UPDATE `members` SET `memberNickname` = ? WHERE `userId` = ?', [memberNickname, userId]);
	}
	async updateChannel(channel) {
		const channelId = channel.id;
		const channelName = channel.name;
		const channelTopic = channel.topic;

		const [rows] = await this.connection.execute('SELECT * FROM `channels` WHERE `channelId` = ?', [channelId]);
		if (!rows[0]) {
			const serverId = channel.guildId;

			await this.connection.execute('INSERT INTO `channels` values (?, ?, ?, ?)', [channelId, serverId, channelName, channelTopic]);
		}
		else await this.connection.execute('UPDATE `channels` SET `channelName` = ?, `channelTopic` = ? WHERE `channelId` = ?', [channelName, channelTopic, channelId]);
	}

	async updateOnInteraction(interaction) {
		await this.updateGuild(interaction.guild);
		if (interaction.inGuild()) await this.updateMember(interaction.member);
		else await this.updateUser(interaction.user);
		await this.updateChannel(interaction.channel);

		const interactionId = interaction.id;
		const serverId = interaction.guildId;
		const channelId = interaction.channelId;
		const userId = interaction.user.id;
		const time = Math.round(Date.now() / 1000);
		const commandName = interaction.commandName;
		const commandArgs = interaction.toString();

		await this.connection.execute('INSERT INTO `interactions` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [interactionId, serverId, channelId, userId, time, commandName, commandArgs, '', '']);
	}
	async existsId(id) {
		if (!id) return true;

		let [rows] = await this.connection.execute('SELECT * FROM `servers` WHERE `helpId` = ?', [id]);
		if (rows[0]) return true;

		[rows] = await this.connection.execute('SELECT * FROM `errors` WHERE `errorId` = ?', [id]);
		if (rows[0]) return true;

		return false;
	}
	async reply(interaction, successful, result, userReply) {
		await this.connection.execute('UPDATE `interactions` SET `successful` = ?, `result` = ? WHERE `interactionId` = ?', [successful, result, interaction.id]);
		if (userReply) await interaction.editReply(userReply);
	}
	async voted(userId, time) {
		const [rows] = await this.connection.execute('SELECT * FROM `votes` WHERE userId = ? AND `time` >= ?', [userId, time]);
		return rows;
	}

	getConnection() {
		return this.connection;
	}
}

module.exports = mysql;