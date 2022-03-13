module.exports = {
	name: 'ready',
	once: true,
	execute(c) {
		client = c;
		new (require('../mysql'))().setup();
		setInterval(setActivity, 30000);
		setPermissions();
		console.log('Ready!');
	},
};

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