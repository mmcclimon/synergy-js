import type { ComponentBuilder } from '../hub-component';
import { Channel } from './base';
import { SlackChannel } from './slack';

export const ChannelRegistry: Record<string, ComponentBuilder<Channel>> = {
  SlackChannel: SlackChannel,
};
