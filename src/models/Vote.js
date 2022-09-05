const { DataTypes, Model } = require('sequelize');

module.exports = class Vote extends Model {
	static init(sequelize) {
		return super.init({
			voteId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.STRING(20) },
		}, {
			tableName: 'votes',
			sequelize,
		});
	}
};