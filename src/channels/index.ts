import { Hub } from '../hub';
import SlackChannel from './slack';

export interface Channel {
  name: string;
  hub: Hub;
  start: () => void;
  sendMessage: (addr: string, text: string) => void;
}

export { SlackChannel };
