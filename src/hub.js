const fs = require('fs');
const Logger = require('./logger.js');
const UserDirectory = require('./user-directory.js');

const channel = require('./channels');

const EchoReactor = require('./reactors/echo');

module.exports = class SynergyHub {
  // alternate constructor
  static fromFile(filename) {
    const config = JSON.parse(fs.readFileSync(filename));

    config.channels = config.channels || {};
    config.reactors = config.reactors || {};

    return new SynergyHub(config);
  }

  constructor(config) {
    this.config = config; // todo
    this.channels = {};
    this.reactors = {};

    this.userDirectory = new UserDirectory(config);

    for (const [name, channel] of Object.entries(config.channels)) {
      this.registerChannel(name, channel);
    }

    this.reactors['echo'] = new EchoReactor({ hub: this, name: 'echo' });
  }

  async run() {
    await this.userDirectory.isReady();
    Object.values(this.channels).forEach(channel => channel.start());
  }

  registerChannel(name, config) {
    const chan = channel.fromConfig(this, name, config);
    this.channels[name] = chan;
  }

  handleEvent(event) {
    Logger.info(`handling event: ${event.text}`);

    // naive implementation for now
    const hits = [];
    for (const reactor of Object.values(this.reactors)) {
      hits.push(...reactor.listenersMatching(event).map(l => [reactor, l]));
    }

    for (const [reactor, listener] of hits) {
      try {
        listener.method.call(reactor, event);
      } catch (e) {
        event.reply(`My ${reactor.name} reactor crashed while handling your message. Oopies!`);
        Logger.error(`error with ${listener.name} listener on ${reactor.name}: ${e}`);
      }
    }
  }
};
