module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		let event;
		if (interaction.isCommand()) event = require('./interactions/commandInteraction');
		else if (interaction.isButton()) event = require('./interactions/buttonInteraction');
		else if (interaction.isSelectMenu()) event = require('./interactions/selectMenuInteraction');
		else return;

		event.execute(interaction);
	},
};