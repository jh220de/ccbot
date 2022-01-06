const { token, topgg } = require('../config.json');

const { ShardingManager } = require('discord.js');
const { AutoPoster } = require('topgg-autoposter');
const { Webhook } = require('@top-gg/sdk');
const express = require('express');

const manager = new ShardingManager('./src/bot.js', {
    totalShards: 'auto',
    token: token,
    spawnTimeout: -1,
    respawn: true
});

const whserver = topgg.enabled ? express() : undefined;
const ap = topgg.enabled ? AutoPoster(topgg, client) : undefined;
const webhook = topgg.enabled ? new Webhook(topgg.webhook) : undefined;

manager.on('shardCreate', shard => {
    const start = Date.now();
    console.log(`Starting shard ${shard.id}...`);
    shard.once('ready', () => {
        const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        return console.log(`Shard ${shard.id} started! Startup process took ${time}ms.`);
    });
});
if(topgg.enabled) ap.on('posted', () => console.log("Posted stats to Top.gg!"));
if(topgg.enabled) whserver.post('/dblwebhook', webhook.listener(vote => {
    console.log(vote.user);
}));

manager.spawn();
if(topgg.enabled) whserver.listen(1337);