import { HubComponent } from '../hub-component';
import { Reactor } from './base';
import { EchoReactor } from './echo';

type ReactorRegistry = Record<string, new (arg) => Reactor>;

const registry: ReactorRegistry = {
  EchoReactor: EchoReactor,
};

const fromConfig = function(hub, name, config): Reactor {
  const builder = registry[config.class];
  return HubComponent.fromConfig(builder, hub, name, config);
};

export { fromConfig };
