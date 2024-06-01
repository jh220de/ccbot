"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
            modId: { type: DataTypes.STRING(18) },
            pardonReason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
            pardonModId: { type: DataTypes.STRING(18), allowNull: true, defaultValue: null },
        }, {
            tableName: 'user_bans',
            sequelize,
        });
    }
};
