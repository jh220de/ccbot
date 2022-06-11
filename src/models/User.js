const { DataTypes, Model } = require('sequelize');

module.exports = class User extends Model {
	static init(sequelize) {
		return super.init({
			userId: {
				type: DataTypes.STRING(18),
				primaryKey: true,
			},
			userName: { type: DataTypes.STRING(32) },
			userDiscriminator: { type: DataTypes.INTEGER(4) },
			userPicture: { type: DataTypes.STRING },
			created: { type: DataTypes.DATE },
		}, {
			tableName: 'users',
			sequelize,
		});
	}
};