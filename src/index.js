const { ShardingManager } = require('discord.js');

// Creates the sharding manager instance
const manager = new ShardingManager('./src/bot.js', { token: require('../config.json').token });

// Enable TopGG stats posting and vote listening if set up in config
if (require('../config.json').topgg.enabled) require('./topgg').start(manager);

// Runs when a shard is getting started
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id + 1}`));

// Spawns the different shards
manager.spawn().catch(error => console.log(error));