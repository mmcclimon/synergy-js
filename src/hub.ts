import * as fs from 'fs';
import * as util from 'util';
const Logger = require('./logger.js');
const UserDirectory = require('./user-directory.js');

const channel = require('./channels');
const reactor = require('./reactors');

module.exports = class SynergyHub {
  config: any;  // XXX
  userDirectory: any;
  channels: Record<string, any>;
  reactors: Record<string, any>;

  // alternate constructor
  static fromFile(filename) {
    const config = JSON.parse(fs.readFileSync(filename).toString());

    config.channels = config.channels || {};
    config.reactors = config.reactors || {};

    return new SynergyHub(config);
  }

  constructor(config) {
    this.config = config; // todo
    this.channels = {};
    this.reactors = {};

    this.userDirectory = new UserDirectory(config);

    for (const thingType of ['channel', 'reactor']) {
      const plural = thingType + 's';

      for (const [name, cfg] of Object.entries(config[plural])) {
        this.registerThing(thingType, name, cfg);
      }
    }
  }

  async run() {
    await this.userDirectory.isReady();
    Object.values(this.channels).forEach(channel => channel.start());
  }

  registerThing(thingType, name, config) {
    const plural = thingType + 's';
    const thing = thingType === 'channel' ? channel : reactor;
    this[plural][name] = thing.fromConfig(this, name, config);
  }

  handleEvent(event) {
    Logger.info(
      util.format(
        '%s event from %s/%s: %s',
        event.type,
        event.fromChannel.name,
        event.fromUser ? `u:${event.fromUser.username}` : event.fromAddress,
        event.text
      )
    );

    // naive implementation for now
    const hits = [];
    for (const reactor of Object.values(this.reactors)) {
      hits.push(...reactor.listenersMatching(event).map(l => [reactor, l]));
    }

    for (const [reactor, listener] of hits) {
      try {
        listener.method.call(reactor, event);
      } catch (e) {
        const resp = util.format(
          'My %s reactor crashed while handling your message...oopies!',
          reactor.name
        );

        event.reply(resp);
        Logger.error(
          util.format(
            'error with %s listener on %s: %s',
            listener.name,
            reactor.name,
            e
          )
        );
      }
    }
  }
};
