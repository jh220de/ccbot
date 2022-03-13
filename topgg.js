const { Webhook } = require('@top-gg/sdk');
const { AutoPoster } = require('topgg-autoposter');
const { topgg } = require('./config.json');

module.exports = {
	async start(client) {
		const app = require('express')();
		const connection = new (require('./mysql'))().getConnection();

		const webhook = new Webhook(topgg.webhook);
		const autoposter = AutoPoster(topgg.token, client);

		app.post('/', webhook.listener(async vote => {
			connection.execute('INSERT INTO `votes` values (?, ?)', [vote.user, Math.round(Date.now() / 1000)]);
		}));

		autoposter.on('posted', () => {
			console.log('Top.gg: Posted stats.');
		});

		app.listen(topgg.port);
	},
};