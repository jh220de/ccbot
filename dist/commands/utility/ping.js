"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    /** @param {import('discord.js').CommandInteraction} interaction */
    async execute(interaction) {
        await interaction.reply(`Pong!\nShard ${interaction.guild.shardId + 1}: ${interaction.client.ws.ping}ms`);
    },
};
