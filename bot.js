const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const event = require('./events/ready');
client.once(event.name, (...args) => event.execute(...args));

setTimeout(() => client.ws.connection.triggerReady(), 30000);
client.login(require('./config.json').token);