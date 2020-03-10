import BaseReactor  from './base';
import type { Listener } from './';
import SynergyEvent from '../event';

export default class EchoReactor extends BaseReactor {
  get listenerSpecs(): Array<Listener> {
    return [
      {
        name: 'echo',
        method: this.echo,
        predicate: (e: SynergyEvent): boolean => e.wasTargeted,
      },
    ];
  }

  echo(event: SynergyEvent): void {
    const from = event.fromUser ? event.fromUser.username : event.fromAddress;
    const resp = `I heard you, ${from}. You said: ${event.text}`;

    event.reply(resp);
    event.markHandled();
  }
}
