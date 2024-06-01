"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require('sequelize');
module.exports = class database {
    constructor() {
        if (database.instance instanceof database)
            return database.instance;
        database.instance = this;
    }
    async setup(logger) {
        this.logger = logger;
        if (this.connection)
            return this.connection;
        logger.debug('Connecting to database...');
        this.connection = await new Sequelize(require('../config.json').database, { logging: msg => logger.debug(msg) });
        logger.debug('Syncing models...');
        const modelFiles = require('node:fs').readdirSync('./dist/models').filter(file => file.endsWith('.js'));
        for (const file of modelFiles) {
            logger.debug(`Syncing model ${file}`);
            const Model = require(`./models/${file}`);
            await Model.init(this.connection);
            await Model.sync();
        }
        logger.debug('Database setup complete.');
        return this.connection;
    }
    getConnection() {
        return this.connection;
    }
};
