import { Hub } from '../hub';
import SlackChannel from './slack';
import ConsoleChannel from './console';

export interface Channel {
  name: string;
  hub: Hub;
  start: () => void;
  sendMessage: (addr: string, text: string) => void;
}

export { SlackChannel, ConsoleChannel };
