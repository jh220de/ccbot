import { Logger } from './logger';

const Sequelize = require('sequelize');

module.exports = class database {
	static instance: database;
	logger: Logger;

	constructor() {
		if (database.instance instanceof database) return database.instance;
		database.instance = this;
	}

	async setup(logger: Logger) {
		this.logger = logger;
		if (this.connection) return this.connection;

		logger.debug('Connecting to database...');
		this.connection = await new Sequelize(require('../../config.json').database, { logging: msg => logger.debug(msg) });

		logger.debug('Syncing models...');
		const modelFiles = require('node:fs').readdirSync('./dist/models').filter(file => file.endsWith('.js'));
		for (const file of modelFiles) {
			logger.debug(`Syncing model ${file}`);
			const Model : any = require(`../models/${file}`);
			await Model.init(this.connection);
			await Model.sync();
		}
		logger.debug('Models synced.');

		logger.debug('Database setup complete.');
		return this.connection;
	}

	connection: any;
	getConnection() {
		return this.connection;
	}
};