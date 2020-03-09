const Reactor = require('./base.js');
const Logger = require('../logger.js');

module.exports = class EchoReactor extends Reactor {
  get listenerSpecs() {
    return [
      {
        name: 'echo',
        method: this.echo,
        predicate: e => e.wasTargeted
      }
    ];
  }

  echo(event) {
    const from = event.fromUser ? event.fromUser.username : event.fromAddress;
    const resp = `I heard you, ${from}. You said: ${event.text}`;

    event.reply(resp);
    event.markHandled();
  }
};
