import { Hub } from '../hub';
import SynergyEvent from '../event';

import EchoReactor from './echo';
import CloxReactor from './clox';
import PrefsReactor from './prefs';

export type ReactorConstructor = new (arg) => Reactor;
export type ReactorHandler = (event: SynergyEvent) => void;

export interface Listener {
  handler: ReactorHandler;
  klass: ReactorConstructor;
  match?: RegExp | ((e: SynergyEvent) => boolean);
  aliases?: Array<string>;
  passive?: boolean;
}

export interface Reactor {
  name: string;
  hub: Hub;
  start: () => void;
}

export const ReactorRegistry: Record<string, new (arg) => Reactor> = {
  CloxReactor: CloxReactor,
  EchoReactor: EchoReactor,
  PrefsReactor: PrefsReactor,
};
