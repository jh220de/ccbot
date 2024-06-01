"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { DataTypes, Model } = require('sequelize');
module.exports = class Vote extends Model {
    static init(sequelize) {
        return super.init({
            voteId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: { type: DataTypes.STRING(18) },
        }, {
            tableName: 'votes',
            sequelize,
        });
    }
};
