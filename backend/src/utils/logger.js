const pino = require('pino');
const { NODE_ENV } = require('../config/config');

const logger = pino({
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

module.exports = logger; 