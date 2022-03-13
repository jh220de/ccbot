const { ShardingManager } = require('discord.js');
const { token, topgg } = require('./config.json');

const manager = new ShardingManager('./bot.js', { token: token });

(async () => {
	await new (require('./mysql'))().setup();
	if (topgg.enabled) require('./topgg').start(manager);
})();

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();