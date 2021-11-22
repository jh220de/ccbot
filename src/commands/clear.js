const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clears ♻️ the message history by a specified amount of messages")
        .addIntegerOption(option => option.setName('amount').setDescription("Number of messages to clear"))
        .addUserOption(option => option.setName('target').setDescription("Clear messages only from a specific user")),
    async execute(interaction) {
        if (interaction.guild == null)
            return interaction.reply({ content: "You can use this command only on servers!", ephemeral: true });
        if (!interaction.channel.permissionsFor(interaction.member).has('MANAGE_MESSAGES'))
            return interaction.reply({ content: "You do not have enough permissions to do this.", ephemeral: true });

        var amount = interaction.options.getInteger('amount');
        if (!amount) amount = 100;
        const user = interaction.options.getUser('target');

        if (amount < 1 || amount > 100) return interaction.reply({ content: "You need to input a number between 1 and 100.", ephemeral: true });

        await interaction.channel.messages.fetch({ limit: amount }).then(fetchMessages => {
            var messages = fetchMessages.filter(message => !message.pinned);
            if (user) messages = messages.filter(message => message.author.id == user.id);
            interaction.channel.bulkDelete(messages, true).then(messages => {
                // TODO: No reply setting
                return interaction.reply(`Deleted ${messages.size} message${messages.size != 1 ? 's' : ''} in this channel${user ? ` from ${user}` : ''}.`);
            }).catch();
        }).catch();
    },
};