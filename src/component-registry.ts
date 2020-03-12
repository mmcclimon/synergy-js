import HubComponent from './hub-component';
import { Channel, SlackChannel } from './channels';
import { Reactor, CloxReactor, EchoReactor } from './reactors';

type RegistryRecord<A extends HubComponent> = Record<string, new (arg) => A>;

export const ChannelRegistry: RegistryRecord<Channel> = {
  SlackChannel: SlackChannel,
};

export const ReactorRegistry: RegistryRecord<Reactor> = {
  CloxReactor: CloxReactor,
  EchoReactor: EchoReactor,
};
