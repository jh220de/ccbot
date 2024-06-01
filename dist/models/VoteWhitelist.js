"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { DataTypes, Model } = require('sequelize');
module.exports = class VoteWhitelist extends Model {
    static init(sequelize) {
        return super.init({
            userId: {
                type: DataTypes.STRING(18),
                primaryKey: true,
            },
            modId: { type: DataTypes.STRING(18) },
        }, {
            tableName: 'vote_whitelist',
            sequelize,
        });
    }
};
