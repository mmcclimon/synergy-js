import { HubComponent, ComponentBuilder } from './hub-component';
import { ChannelRegistry } from './channels';
import { ReactorRegistry } from './reactors';

// Maybe I just want to stick the registry in here? Maybe?
type RegistryRecord = Record<string, ComponentBuilder<HubComponent>>;

export const ComponentRegistry: Record<string, RegistryRecord> = {
  channels: ChannelRegistry,
  reactors: ReactorRegistry,
};
