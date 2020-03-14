import { Hub } from '../hub';
import SlackChannel from './slack';
import ConsoleChannel from './console';

export interface Channel {
  name: string;
  hub: Hub;
  start: () => void;
  sendMessage: (addr: string, text: string) => void;
}

export const ChannelRegistry: Record<string, new (arg) => Channel> = {
  SlackChannel: SlackChannel,
  ConsoleChannel: ConsoleChannel,
};
