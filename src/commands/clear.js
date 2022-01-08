const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clears ♻️ the message history by a specified amount of messages")
        .addIntegerOption(option => option.setName('amount').setDescription("Number of messages to clear"))
        .addUserOption(option => option.setName('target').setDescription("Clear messages only from a specific user")),
    async execute(interaction) {
        if (interaction.guild == null)
            return interaction.editReply("You can use this command only on servers!");
        if (interaction.channel.type != 'GUILD_TEXT')
            return interaction.editReply("You can use this command only in text channels on servers!");
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_MESSAGES'))
            return interaction.editReply("You do not have enough permissions to do this.");
        
        const permissions = interaction.channel.permissionsFor(interaction.guild.me);
        if (!permissions.has('VIEW_CHANNEL'))
            return interaction.editReply("The bot has insufficient permissions to view this channel.");
        if (!permissions.has('READ_MESSAGE_HISTORY'))
            return interaction.editReply("The bot has insufficient permissions to read channel history.");
        if (!permissions.has('MANAGE_MESSAGES'))
            return interaction.editReply("The bot has insufficient permissions to manage messages.");

        var amount = interaction.options.getInteger('amount');
        if (!amount) amount = 100;
        const user = interaction.options.getUser('target');

        if (amount < 1 || amount > 100) return interaction.editReply("You need to input a number between 1 and 100.");

        const { connection } = require('../bot');
        const [rows] = await connection.execute('SELECT * FROM `settings` WHERE `serverId` = ?', [interaction.guild.id]);
        var ephemeral = rows[0] ? rows[0].showreply == 0 : false;
        // TODO
        const reply = await interaction.fetchReply();
        
        interaction.channel.messages.fetch({ limit: amount, before: reply.id }).then(fetchMessages => {
            var messages = fetchMessages.filter(message => !message.pinned);
            messages = messages.filter(message => message.id != reply.id)
            if (user) messages = messages.filter(message => message.author.id == user.id);

            interaction.channel.bulkDelete(messages, true).then(messages => {
                interaction.editReply(`Deleted ${messages.size} message${messages.size != 1 ? 's' : ''} in this channel${user ? ` from ${user}` : ''}.`);
                connection.execute('UPDATE `stats` SET `execCount` = ? WHERE `interactionId` = ?', [messages.size, interaction.id]);
            });
        });
    },
};