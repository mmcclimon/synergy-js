import { HubComponent } from '../hub-component';
import { EchoReactor } from './echo';

const REGISTRY = {
  EchoReactor: EchoReactor,
};

const fromConfig = function(hub, name, config): HubComponent {
  return HubComponent.fromConfig(REGISTRY, hub, name, config);
};

export { fromConfig };
