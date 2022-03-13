module.exports = {
	async execute(interaction) {
		return new (require('../mysql'))().reply(interaction, true, 'UNDER_CONSTRUCTION', 'Under construction!');
	},
};