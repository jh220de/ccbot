const { log } = require('../config.json');
const pino = require('pino');

const targets = [
	{
		target: 'pino/file',
		level: log.level,
		options: { destination: './ccbot.log' },
	},
	{
		target: './pretty-logger',
		level: log.level,
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			hideObject: true,
		},
	},
];
if (log.webhook)
	targets.push({
		target: 'pino-discord-webhook',
		level: 'info',
		options: {
			webhookURL: log.webhook,
		} as any,
	});
if (log.logtail) {
	targets.push({
		target: '@logtail/pino',
		level: log.level,
		options: {
			sourceToken: log.logtail,
		},
	} as any);
}
const logger = pino({ level: log.level }, pino.transport({ targets: targets }));

process.on('SIGTERM', () => {
	logger.error('SIGTERM received.');
	logger.info('System shutdown signal received, exiting...');
	logger.info('Stopped Discord ClearChat Bot.');
	process.exit(0);
});

process.on('SIGINT', () => {
	logger.error('SIGINT received.');
	logger.info('Manual exit signal received, exiting...');
	logger.info('Stopped Discord ClearChat Bot.');
	process.exit(0);
});

logger.info('Starting Discord ClearChat Bot...');
const botStart = Date.now();

const { ShardingManager } = require('discord.js');
const { token, topgg } = require('../config.json');

const manager = new ShardingManager('./dist/bot.js', { token: token });

if (topgg.enabled)
	require('./topgg').start(manager, logger);

manager.on('shardCreate', shard => {
	const childLogger = logger.child({ shard: shard.id + 1 });
	let start;
	shard.on('message', message => {
		if (message.type == 'log')
			childLogger[message.level](message.log);
	});
	shard.on('spawn', () => {
		start = Date.now();
		childLogger.info('Starting...');
	});
	shard.on('ready', () => {
		const time = (Date.now() - start).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		childLogger.info(`Started! Startup process took ${time}ms`);
		shard.fetchClientValue('guilds.cache.size').then(count => {
			childLogger.info(`Managing ${count} guild${count != 1 ? 's' : ''}.`);
		});

	});
	shard.on('reconnection', () => childLogger.info('Reconnecting...'));
	shard.on('death', () => logger.error(`Shard ${shard.id + 1} died!`));
	shard.on('error', error => {
		childLogger.error(`Error:\n${error}`);
		shard.respawn();
	});
});

manager.spawn().then(() => {
	const time = (Date.now() - botStart).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
	logger.info(`Discord ClearChat Bot started! Startup process took ${time}ms`);
});