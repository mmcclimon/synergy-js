import * as winston from 'winston';
import * as util from 'util';

type LoggerCall = (msg: string | Array<any>) => void;

interface Logger {
  info: LoggerCall;
  warn: LoggerCall;
  error: LoggerCall;
  debug: LoggerCall;
  verbose: LoggerCall;
}

const format = winston.format;
const logger: Logger = winston.createLogger({
  level: process.env.DEBUG ? 'debug' : 'verbose',
  format: format.cli(),
  defaultMeta: { service: 'synergy' },
  transports: [new winston.transports.Console()],
});

// get a Log::Dispatchouli interface: pass an array to get sprintf formatting
const wrap = function(orig) {
  return function(msg): void {
    let formatted = msg;

    if (Array.isArray(msg)) {
      // silly: without this, TS gives 'expect at least 1 arg, got 0 or more'
      const first = msg.shift();
      formatted = util.format(first, ...msg);
    }

    return orig(formatted);
  };
};

['info', 'warn', 'error', 'debug', 'verbose'].forEach(
  level => (logger[level] = wrap(logger[level]))
);

export default logger;
