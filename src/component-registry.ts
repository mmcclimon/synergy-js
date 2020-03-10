import { HubComponent } from './hub-component';
import { Channel, SlackChannel } from './channels';
import { Reactor, EchoReactor } from './reactors';

type ComponentBuilder<A extends HubComponent> = new (arg) => A;
type RegistryRecord = Record<string, ComponentBuilder<HubComponent>>;

export const ChannelRegistry: Record<string, ComponentBuilder<Channel>> = {
  SlackChannel: SlackChannel,
};

export const ReactorRegistry: Record<string, ComponentBuilder<Reactor>> = {
  EchoReactor: EchoReactor,
};

export const ComponentRegistry: Record<string, RegistryRecord> = {
  channels: ChannelRegistry,
  reactors: ReactorRegistry,
};
