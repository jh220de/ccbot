const { DataTypes, Model } = require('sequelize');

module.exports = class AutoClear extends Model {
	static init(sequelize) {
		return super.init({
			channelId: {
				type: DataTypes.STRING(20),
				primaryKey: true,
			},
			serverId: { type: DataTypes.STRING(10) },
			mode: { type: DataTypes.STRING(20) },
			duration: { type: DataTypes.INTEGER(6) },
		}, {
			tableName: 'autoclear',
			sequelize,
		});
	}
};