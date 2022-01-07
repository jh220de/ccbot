const { token, topgg, sql } = require('../config.json');

const { ShardingManager } = require('discord.js');
const { AutoPoster } = require('topgg-autoposter');
const { Webhook } = require('@top-gg/sdk');
const express = require('express');
const mysql = require('mysql2/promise');

const manager = new ShardingManager('./src/bot.js', {
    totalShards: 'auto',
    token: token,
    spawnTimeout: -1,
    respawn: true
});

const whserver = topgg.enabled ? express() : undefined;
const ap = topgg.enabled ? AutoPoster(topgg.token, manager) : undefined;
const webhook = topgg.enabled ? new Webhook(topgg.webhook) : undefined;
var connection;

manager.on('shardCreate', shard => {
    const start = Date.now();
    console.log(`Starting shard ${shard.id}...`);
    shard.once('ready', () => {
        const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        return console.log(`Shard ${shard.id} started! Startup process took ${time}ms.`);
    });
});
if(topgg.enabled) ap.on('posted', () => console.log("Posted stats to Top.gg!"));
if(topgg.enabled) whserver.post('/', webhook.listener(vote => addVote(vote.user)));

async function addVote(userId) {
    connection.execute('INSERT INTO `votes` values (?, ?)', [userId, Math.round(Date.now()/1000)]);
}

(async () => {
    console.log(0);
    connection = await mysql.createConnection({
        host: sql.host,
        port: sql.port,
        database: sql.database,
        user: sql.user,
        password: sql.password
    });
    console.log(1);
})();

manager.spawn();
if(topgg.enabled) whserver.listen(1337);