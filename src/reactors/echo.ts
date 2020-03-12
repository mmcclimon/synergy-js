import BaseReactor from './base';
// import { Listener } from './';
import SynergyEvent from '../event';
import Commando from '../commando';

export default class EchoReactor extends BaseReactor {}

Commando.registerListener('echo', {
  match: /./,
  klass: EchoReactor,
  handler: function(event: SynergyEvent) {
    const from = event.fromUser ? event.fromUser.username : event.fromAddress;
    const resp = `I heard you, ${from}. You said: ${event.text}`;

    event.reply(resp);
    event.markHandled();
  },
});
