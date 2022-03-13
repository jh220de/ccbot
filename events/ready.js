const { Collection } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(c) {
		client = c;
		await new (require('../mysql'))().setup();
		setInterval(setActivity, 30000);
		setPermissions();
		registerCommands();
		registerEvents();
		experimental();
	},
};

async function experimental() {
	const wait = require('util').promisify(setTimeout);
	const mysql = new (require('../mysql'))();
	client.guilds.cache.forEach(guild => {
		mysql.updateGuild(guild);
		wait(10000);
	});
	console.log('Ready!');
}

async function registerCommands() {
	client.commands = new Collection();
	const commandFiles = require('node:fs').readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`../commands/${file}`);
		client.commands.set(command.data.name, command);
	}
}
async function registerEvents() {
	const eventFiles = require('node:fs').readdirSync(__dirname).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`./${file}`);
		if (event.name == 'ready') continue;
		if (event.once) client.once(event.name, (...args) => event.execute(...args));
		else client.on(event.name, (...args) => event.execute(...args));
	}
}

let count = 1;
let client;
async function setActivity() {
	let display = 'jh220.de/ccbot';
	const connection = new (require('../mysql'))().getConnection();

	if (count == 1 || count == 2) {
		const [rows] = await connection.execute('SELECT COUNT(*) FROM `servers` WHERE `botLeave` IS NULL');
		display = `${rows[0]['COUNT(*)'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} servers`;
	}
	else if (count == 3) {
		const [rows] = await connection.execute('SELECT SUM(`memberCount`) FROM `servers`');
		display = `${rows[0]['SUM(`memberCount`)'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} members`;
	}
	else if (count == 4) {
		const [rows] = await connection.execute('SELECT COUNT(*) FROM `users`');
		display = `${rows[0]['COUNT(*)'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} users`;
	}
	else count = 0;

	count++;
	client.user.setActivity(`/clear | ${display}`, { type: 'WATCHING' });
}
async function setPermissions() {
	const { adminCommand } = require('../config.json');
	if (!client.application?.owner) await client.application?.fetch();
	if (!client.guilds.cache.get(adminCommand.serverId)) return;
	const command = await client.guilds.cache.get(adminCommand.serverId)?.commands.fetch(adminCommand.commandId);
	const permissions = [
		{
			id: adminCommand.ownerId,
			type: 'USER',
			permission: true,
		},
		{
			id: adminCommand.roleId,
			type: 'ROLE',
			permission: true,
		},
	];
	await command.permissions.add({ permissions });
}