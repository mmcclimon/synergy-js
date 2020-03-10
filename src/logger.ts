import * as winston from 'winston';

type LoggerCall = (msg: string) => void;

interface Logger {
  info: LoggerCall;
  warn: LoggerCall;
  error: LoggerCall;
  debug: LoggerCall;
}

const format = winston.format;
const logger: Logger = winston.createLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  format: format.cli(),
  defaultMeta: { service: 'synergy' },
  transports: [new winston.transports.Console()],
});

export default logger;
