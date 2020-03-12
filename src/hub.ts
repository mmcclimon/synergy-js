import * as fs from 'fs';
import * as util from 'util';

import Logger from './logger';
import UserDirectory from './user-directory';
import SynergyEvent from './event';

import HubComponent from './hub-component';
import { Channel } from './channels';
import { Reactor } from './reactors';
import ComponentRegistry from './component-registry';
import Commando from './commando';

// not great, but it's something
interface Config {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  channels: Record<string, Record<string, any>>;
  reactors: Record<string, Record<string, any>>;
  state_dbfile?: string;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export class Hub {
  config: Config;
  userDirectory: UserDirectory;
  channels: Record<string, Channel>;
  reactors: Record<string, Reactor>;
  commando: typeof Commando;

  // alternate constructor
  static fromFile(filename): Hub {
    const config = JSON.parse(fs.readFileSync(filename).toString());

    config.channels = config.channels || {};
    config.reactors = config.reactors || {};

    return new Hub(config);
  }

  constructor(config) {
    this.config = config; // todo
    this.channels = {};
    this.reactors = {};
    this.commando = Commando;

    this.userDirectory = new UserDirectory(config);

    for (const thingType of ['channel', 'reactor']) {
      const plural = thingType + 's';

      for (const [name, cfg] of Object.entries(config[plural])) {
        this.registerThing(thingType, name, cfg);
      }
    }
  }

  async run(): Promise<void> {
    await this.userDirectory.isReady();
    Object.values(this.channels).forEach(channel => channel.start());

    // not sure this is actually right
    return Promise.resolve();
  }

  registerThing(thingType, name, config): void {
    const plural = thingType + 's';

    const builder = ComponentRegistry[plural][config.class];
    const component = HubComponent.fromConfig(builder, this, name, config);

    this[plural][name] = component;

    // at this time, we have a reactor.
    this.commando.reifyCommandsOn(component);
  }

  handleEvent(event: SynergyEvent): void {
    Logger.info(
      util.format(
        '%s event from %s/%s: %s',
        event.type,
        event.fromChannel.name,
        event.fromUser ? `u:${event.fromUser.username}` : event.fromAddress,
        event.text
      )
    );

    this.commando.dispatch(event);
  }
}
