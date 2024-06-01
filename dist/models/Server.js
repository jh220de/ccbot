"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { DataTypes, Model } = require('sequelize');
module.exports = class Server extends Model {
    static init(sequelize) {
        return super.init({
            serverId: {
                type: DataTypes.STRING(18),
                primaryKey: true,
            },
            guildId: { type: DataTypes.STRING(18) },
            serverName: { type: DataTypes.STRING(100) },
            serverPicture: { type: DataTypes.STRING },
            created: { type: DataTypes.DATE },
            shardId: { type: DataTypes.INTEGER(5) },
            invites: { type: DataTypes.TEXT },
            memberCount: { type: DataTypes.INTEGER(8) },
            ownerId: { type: DataTypes.STRING(18) },
            botJoin: { type: DataTypes.DATE },
            botLeave: { type: DataTypes.DATE },
        }, {
            tableName: 'servers',
            sequelize,
        });
    }
};
