import { Hub } from './hub';

// for want of a role...
export default abstract class HubComponent {
  name: string;
  hub: Hub;

  constructor({ name, hub }) {
    this.name = name;
    this.hub = hub;
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
