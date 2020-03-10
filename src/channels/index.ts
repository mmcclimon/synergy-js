import { HubComponent } from '../hub-component';
import { Channel } from './base';
import { SlackChannel } from './slack';

type ChannelRegistry = Record<string, new (arg) => Channel>;

const registry: ChannelRegistry = {
  SlackChannel: SlackChannel,
};

const fromConfig = function(hub, name, config): Channel {
  const builder = registry[config.class];
  return HubComponent.fromConfig(builder, hub, name, config);
};

export { fromConfig };
