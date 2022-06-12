const { ShardingManager } = require('discord.js');

// Creates the sharding manager instance
const manager = new ShardingManager('./src/bot.js', {
	token: require('../config.json').token,
	mode: 'worker',
});

// Enable TopGG stats posting and vote listening if set up in config
if (require('../config.json').topgg.enabled) require('./topgg').start(manager);

// Runs when a shard is getting started
manager.on('shardCreate', shard => {
	const start = Date.now();
	console.log(`Starting shard ${shard.id + 1}...`);
	shard.once('ready', () => {
		const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		return console.log(`Shard ${shard.id + 1} started! Startup process took ${time}ms`);
	});
});

// Spawns the different shards
manager.spawn().catch(error => console.log(error));