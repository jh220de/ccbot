const { DataTypes, Model } = require('sequelize');

module.exports = class VoteWhitelist extends Model {
	static init(sequelize) {
		return super.init({
			userId: {
				type: DataTypes.STRING(20),
				primaryKey: true,
			},
			modId: { type: DataTypes.STRING(20) },
		}, {
			tableName: 'vote_whitelist',
			sequelize,
		});
	}
};