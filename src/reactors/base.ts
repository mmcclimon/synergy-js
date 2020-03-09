import { HubComponent } from '../hub-component';
import { SynergyEvent } from '../event';

export interface Listener {
  name: string;
  method: (event: SynergyEvent) => void;
  predicate: (event: SynergyEvent) => boolean;
}

export abstract class Reactor extends HubComponent {
  constructor(arg) {
    super(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start(): void {}

  get listenerSpecs(): Array<Listener> {
    return [];
  }

  listenersMatching(event): Array<Listener> {
    return this.listenerSpecs.filter(l => l.predicate(event));
  }
}
