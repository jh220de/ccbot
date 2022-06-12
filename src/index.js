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
	let start;
	shard.on('spawn', () => {
		start = Date.now();
		console.log(`Starting shard ${shard.id + 1}...`);
	});
	shard.on('ready', () => {
		const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		console.log(`Shard ${shard.id + 1} started! Startup process took ${time}ms`);
	});
	shard.on('reconnection', () => console.log(`Reconnecting shard ${shard.id + 1}...`));
	shard.on('death', () => console.log(`Died shard ${shard.id + 1}!`));
	shard.on('error', error => {
		console.log(`Error shard ${shard.id + 1}:\n${error}`);
		shard.respawn();
	});
});

// Spawns the different shards
manager.spawn().catch(error => console.log(error));