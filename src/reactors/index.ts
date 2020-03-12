import { Hub } from '../hub';
import SynergyEvent from '../event';

import EchoReactor from './echo';

export type ReactorConstructor = new (arg) => Reactor;
export type ReactorHandler = (event: SynergyEvent) => void;

export interface Listener {
  handler: ReactorHandler;
  klass: ReactorConstructor;
  match?: RegExp;
}

export interface Reactor {
  name: string;
  hub: Hub;
  start: () => void;
}

// re-export all the reactor types
export { EchoReactor };
