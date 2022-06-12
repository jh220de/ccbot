module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		// Create database instance and setup a new connection to it
		await new (require('../database'))().setup();

		// Sets the bot's activity
		setTimeout(() => setActivity(client), 1000);
		setInterval(() => setActivity(client), 30000);
	},
};


let count = 1;
async function setActivity(client) {
	// Get sequelize instance
	const { models } = new (require('../database'))().getConnection();

	let display = 'jh220.de/ccbot';

	if (count == 1 || count == 2) {
		// Get total count of active servers
		const servers = await models.Server.count({ where: { botLeave: null } });
		display = `${servers.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} servers`;
	}
	else if (count == 3) {
		// Get sum of member count of all active servers
		// const members = await models.Server.sum('memberCount', { where: { [Op.not]: { botLeave: null } } });
		const members = 0;
		display = `${members.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} members`;
	}
	else if (count == 4) {
		// Get count of all users
		const users = await models.User.count();
		display = `${users.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')} users`;
	}
	else count = 0;

	count++;

	// Set the bots acitivty as type watching
	client.user.setActivity(`/clear | ${display}`, { type: 'WATCHING' });
}