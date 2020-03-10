import { ComponentBuilder } from '../hub-component';
import { Reactor } from './base';
import { EchoReactor } from './echo';

export const ReactorRegistry: Record<string, ComponentBuilder<Reactor>> = {
  EchoReactor: EchoReactor,
};
