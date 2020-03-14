import * as moment from 'moment-timezone';

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

    // TODO: get zones from user directory
    const tzNames = ['America/New_York', 'Australia/Sydney', 'Etc/UTC'];

    // TODO: clox at not-now
    const now = moment();

    const tzmap = Object.fromEntries(
      tzNames.map(tz => [tz, moment.tz.zone(tz).utcOffset(now)])
    );

    const sorted = tzNames.slice().sort((a, b) => tzmap[a] - tzmap[b]);
    const resp = [];

    sorted.forEach(zone => {
      const offset = now
        .clone()
        .tz(zone)
        .utcOffset();

      const targetTime = now
        .clone()
        .utc()
        .add(offset, 'minutes');

      const timeStr = targetTime.format('HH:mm [on] dddd');
      let zoneStr = moment.tz.zone(zone).abbr(now);

      // this will be much nicer when node fully supports optional chaining:
      // const zoneStr = this.hub.config.timeZoneNames?.[zone] || moment.tz.zone(zone).abbr(now);

      if (this.hub.config.timeZoneNames) {
        zoneStr = this.hub.config.timeZoneNames[zone] || zoneStr;
      }

      resp.push(`${zoneStr}: ${timeStr}`);
    });

    event.reply(resp.join('\n'));
  },
});
