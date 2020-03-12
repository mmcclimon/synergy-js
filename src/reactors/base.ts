import HubComponent from '../hub-component';
import { Listener } from './';
import SynergyEvent from '../event';

export default abstract class BaseReactor extends HubComponent {
  constructor(arg) {
    super(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start(): void {}

  get listenerSpecs(): Array<Listener> {
    return [];
  }

  listenersMatching(event: SynergyEvent): Array<Listener> {
    return this.listenerSpecs.filter(l => l.predicate(event));
  }
}
