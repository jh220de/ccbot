const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const event = require('./events/ready');
client.once(event.name, (...args) => event.execute(...args));

client.login(require('./config.json').token);