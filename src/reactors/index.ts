import { Hub } from '../hub';
import SynergyEvent from '../event';

import EchoReactor from './echo';

export interface Listener {
  name: string;
  method: (event: SynergyEvent) => void;
  predicate: (event: SynergyEvent) => boolean;
}

export interface Reactor {
  name: string;
  hub: Hub;
  start: () => void;
  listenerSpecs: Array<Listener>;
  listenersMatching: (event: SynergyEvent) => Array<Listener>;
}

export type ReactorConstructor = new (arg) => Reactor;

export { EchoReactor };
