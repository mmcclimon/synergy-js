import * as fs from 'fs';

import Environment from './environment';
import Logger from './logger';
import UserDirectory from './user-directory';
import SynergyEvent from './event';

import HubComponent from './hub-component';
import { Channel, ChannelRegistry } from './channels';
import { Reactor, ReactorRegistry } from './reactors';
import Commando from './commando';

// not great, but it's something
interface Config {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  channels: Record<string, Record<string, any>>;
  reactors: Record<string, Record<string, any>>;
  state_dbfile?: string;
  timeZoneNames?: Record<string, string>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export class Hub {
  config: Config;
  env: Environment;
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

    this.env = new Environment(config);

    for (const thing of ['channels', 'reactors']) {
      const meth = thing === 'channels' ? 'registerChannel' : 'registerReactor';
      const fn = this[meth].bind(this);

      Object.entries(config[thing]).forEach(([name, cfg]) => fn(name, cfg));
    }
  }

  async run(): Promise<void> {
    await this.env.load();
    Object.values(this.reactors).forEach(reactor => reactor.start());
    Object.values(this.channels).forEach(channel => channel.start());
    return;
  }

  registerChannel(name, cfg): void {
    const builder = ChannelRegistry[cfg.class];
    const channel: Channel = HubComponent.fromConfig(builder, this, name, cfg);
    this.channels[name] = channel;
  }

  registerReactor(name, cfg): void {
    const builder = ReactorRegistry[cfg.class];
    const reactor: Reactor = HubComponent.fromConfig(builder, this, name, cfg);
    this.reactors[name] = reactor;

    this.commando.reifyCommandsOn(reactor);
  }

  get userDirectory(): UserDirectory {
    return this.env.userDirectory;
  }

  handleEvent(event: SynergyEvent): void {
    Logger.info([
      '%s event from %s/%s: %s',
      event.type,
      event.fromChannel.name,
      event.fromUser ? `u:${event.fromUser.username}` : event.fromAddress,
      event.text,
    ]);

    this.commando.dispatch(event);

    if (!event.handled) {
      event.reply('Does not compute');
    }
  }

  componentNamed(name: string): HubComponent | UserDirectory {
    if (name === 'user') return this.userDirectory;
    if (this.reactors[name]) return this.reactors[name];
    if (this.channels[name]) return this.channels[name];
    throw new Error(`no hub component found for ${name}`);
  }
}
