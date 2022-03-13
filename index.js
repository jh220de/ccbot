const { ShardingManager } = require('discord.js');
const { token, topgg } = require('./config.json');

const manager = new ShardingManager('./bot.js', { token: token });

(async () => {
	await new (require('./mysql'))().setup();
	if (topgg.enabled) require('./topgg').start(manager);
})();

manager.on('shardCreate', shard => {
	const start = Date.now();
	console.log(`Starting shard ${shard.id}...`);
	shard.once('ready', () => {
		const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		return console.log(`Shard ${shard.id} started! Startup process took ${time}ms`);
	});
});

manager.spawn();