const { DataTypes, Model } = require('sequelize');

module.exports = class Interaction extends Model {
	static init(sequelize) {
		return super.init({
			logId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			serverId: { type: DataTypes.STRING(10) },
			channelId: { type: DataTypes.STRING(20) },
			channelName: { type: DataTypes.STRING(100) },
			userId: { type: DataTypes.STRING(20) },
			command: { type: DataTypes.STRING },
			result: { type: DataTypes.STRING },
			args: { type: DataTypes.TEXT },
		}, {
			tableName: 'logs',
			sequelize,
		});
	}
};