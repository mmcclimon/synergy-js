import BaseReactor from './base';
import Commando from '../commando';

export default class CloxReactor extends BaseReactor {}

Commando.registerListener('clox', {
  aliases: ['clocks'],
  klass: CloxReactor,
  handler: function(event) {
    event.markHandled();

    const now = new Date();

    event.reply(now);
  },
});
