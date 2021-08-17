const { token } = require('../config.json');

const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./src/bot.js', {
    //execArgv: ['--unhandled_rejections=none'],
    token: token,
});

manager.on('shardCreate', shard => {
    console.log(`Starting shard ${shard.id}...`);
    shard.on('ready', () => {
        shard.send({ type: "shardId", data: { shardId: shard.id } });
    });
});

manager.spawn();