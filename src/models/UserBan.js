const { DataTypes, Model } = require('sequelize');

module.exports = class UserBan extends Model {
	static init(sequelize) {
		return super.init({
			banId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.STRING(18) },
			reason: { type: DataTypes.TEXT },
			modId: { type: DataTypes.STRING(18) },
			pardonReason: { type: DataTypes.TEXT },
			pardonModId: { type: DataTypes.STRING(18) },
		}, {
			tableName: 'user_bans',
			sequelize,
		});
	}
};