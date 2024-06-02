import { ActivityType, Events } from 'discord.js';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await new (require('../utils/database'))().setup(client);

		setTimeout(() => setActivity(client), 1000);
		setInterval(() => setActivity(client), 30000);
	},
};


let count = 1;
async function setActivity(client) {
	client.debug(`Setting activity (${count})...`);
	let display = 'jh220.de/ccbot';
	if (count == 1 || count == 2) {
		const serverCount = (await client.shard.fetchClientValues('guilds.cache.size')).reduce((acc, guildCount) => acc + guildCount, 0);
		const serverCountString = serverCount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		display = `${serverCountString} servers`;
	}
	else if (count == 3) {
		const memberCount = await client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
		const memberCountString = memberCount.reduce((acc, memberCountTmp) => acc + memberCountTmp, 0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		display = `${memberCountString} members`;
	}
	else if (count == 4) {
		display = 'jh220.de/ccbot';
	}
	else count = 0;

	count++;
	const activity = `/clear | ${display}`;
	client.user.setActivity(activity, { type: ActivityType.Watching });
	client.debug(`Activity set to "${activity}"`);
}