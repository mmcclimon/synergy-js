import { HubComponent } from '../hub-component';
import { SlackChannel } from './slack';

const REGISTRY = {
  SlackChannel: SlackChannel,
};

const fromConfig = function(hub, name, config): HubComponent {
  return HubComponent.fromConfig(REGISTRY, hub, name, config);
};

export { fromConfig };
