const { ShardingManager } = require('discord.js');
const { token, topgg } = require('./config.json');

const manager = new ShardingManager('./bot.js', {
	totalShards: 'auto',
	token: token,
	respawn: true,
});

(async () => {
	await new (require('./mysql'))().setup();
	if (topgg.enabled) require('./topgg').start(manager);
})();

manager.on('shardCreate', shard => {
	const start = Date.now();
	console.log(`Starting shard ${shard.id + 1}...`);
	shard.once('ready', () => {
		const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		return console.log(`Shard ${shard.id + 1} started! Startup process took ${time}ms`);
	});
	shard.on('error', error => console.error(error));
});

manager.spawn(manager.totalShards, 5500, -1)
	.catch(error => console.error(error));