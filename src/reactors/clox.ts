import BaseReactor from './base';
import Commando from '../commando';

export default class CloxReactor extends BaseReactor {
  alwaysInclude: Array<string>;

  constructor(arg) {
    super(arg);
    this.alwaysInclude = arg.alwaysInclude || [];
  }
}

Commando.registerListener('clox', {
  aliases: ['clocks'],
  klass: CloxReactor,
  handler: function(event) {
    event.markHandled();

    const now = new Date();

    event.reply(now);
  },
});
