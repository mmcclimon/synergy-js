import { Hub } from './hub';

// for want of a role...
export default abstract class HubComponent {
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
