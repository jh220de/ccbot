const { DataTypes, Model } = require('sequelize');

module.exports = class GuildBan extends Model {
	static init(sequelize) {
		return super.init({
			banId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING(20) },
			reason: { type: DataTypes.STRING(1000) },
			modId: { type: DataTypes.STRING(20) },
			pardonReason: { type: DataTypes.STRING(1000) },
			pardonModId: { type: DataTypes.STRING(20) },
		}, {
			tableName: 'guild_bans',
			sequelize,
		});
	}
};