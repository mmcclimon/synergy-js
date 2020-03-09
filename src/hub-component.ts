import { Hub } from './hub';

// for want of a role...
export abstract class HubComponent {
  name: string;
  hub: Hub;

  constructor(arg) {
    this.name = arg.name;
    this.hub = arg.hub;
  }

  static fromConfig(registry, hub, name, config): HubComponent {
    const builder = registry[config.class];

    if (!builder) throw new Error(`no class for reactor ${name}!`);

    return new builder({
      hub: hub,
      name: name,
      ...config,
    });
  }
}
