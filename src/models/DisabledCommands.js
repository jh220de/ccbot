const { DataTypes, Model } = require('sequelize');

module.exports = class DisabledCommands extends Model {
	static init(sequelize) {
		return super.init({
			commandName: {
				type: DataTypes.STRING(20),
				primaryKey: true,
			},
			reason: { type: DataTypes.STRING(1000) },
			modId: { type: DataTypes.STRING(20) },
		}, {
			tableName: 'disabled_commands',
			sequelize,
		});
	}
};