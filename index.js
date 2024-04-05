const { ShardingManager } = require('discord.js');
const { token } = require('./config.json');

const manager = new ShardingManager('./bot.js', { token: token });


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
	shard.on('death', () => console.log(`Shard ${shard.id + 1} died!`));
	shard.on('error', error => {
		console.log(`Error shard ${shard.id + 1}:\n${error}`);
		shard.respawn();
	});
});

manager.spawn();