const winston = require('winston');
const format = winston.format;

const logger = winston.createLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  format: format.cli(),
  defaultMeta: { service: 'synergy' },
  transports: [new winston.transports.Console()],
});

module.exports = logger;
