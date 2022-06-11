const { Webhook } = require('@top-gg/sdk');
const { AutoPoster } = require('topgg-autoposter');
const { topgg } = require('./config.json');

module.exports = {
	/**
	 * When this method is called, the connection with TopGG is established.
	 * This sets up an autoposter that automatically sends the stats, such as the server count, to TopGG at various time intervals.
	 * In addition, an Express app is created that listens for API requests from TopGG, passing votes from users.
	 * @see {@link https://docs.top.gg/libraries/javascript/} for further information.
	 * @param {Client|ShardingManager} client The discord.js client or sharding manager used to post stats to TopGG
	 */
	async start(client) {
		// Create database instance and setup a new connection to it
		const connection = await new (require('./database'))().setup();

		// Creates the express app for the webhook to listen for new votes
		const app = require('express')();

		// Creating webhook instance for new votes
		const webhook = new Webhook(topgg.webhook);
		// Setting up autoposter to post bot's stats to TopGG
		const autoposter = AutoPoster(topgg.token, client);

		// Executes when a new vote is submitted
		app.post('/', webhook.listener(async vote => {
			connection.models.Vote.create({ userId: vote.user });
		}));

		// Executes when the bot's stats are posted to TopGG
		autoposter.on('posted', () => {
			console.log('Posted stats to TopGG.');
		});

		// Listen for new votes
		app.listen(topgg.port);
	},
};