import { Hub } from './hub';

// for want of a role...
export abstract class HubComponent {
  name: string;
  hub: Hub;

  constructor(arg) {
    this.name = arg.name;
    this.hub = arg.hub;
  }

  static fromConfig<A extends HubComponent>(
    builder: new (arg) => A,
    hub,
    name,
    config
  ): A {
    return new builder({
      hub: hub,
      name: name,
      ...config,
    });
  }
}

export type ComponentBuilder<A extends HubComponent> = new (arg) => A;

export type ComponentRegistryRecord = Record<
  string,
  ComponentBuilder<HubComponent>
>;

// we must do this here because there is a circular dependency. meh.
import { ChannelRegistry } from './channels';
import { ReactorRegistry } from './reactors';

export const ComponentRegistry: Record<string, ComponentRegistryRecord> = {
  channels: ChannelRegistry,
  reactors: ReactorRegistry,
};
