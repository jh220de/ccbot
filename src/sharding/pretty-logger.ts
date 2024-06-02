module.exports = opts => require('pino-pretty')({
	...opts,
	customPrettifiers: {
		// eslint-disable-next-line no-unused-vars
		level: (logLevel, key, log, { label, labelColorized, colors }) =>
			(log.shard != null ? `${colors.white('[Shard')} ${colors.bold(log.shard)}${colors.white(']')} ` : '') + `${labelColorized}`,
	},
	// eslint-disable-next-line no-unused-vars
	messageFormat: (log, messageKey, levelLabel, { colors }) => {
		return log[messageKey];
	},
});