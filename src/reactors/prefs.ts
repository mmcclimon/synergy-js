import BaseReactor from './base';
import Commando from '../commando';
import SynergyEvent from '../event';

export default class PrefsReactor extends BaseReactor {
  private setPref(event: SynergyEvent, fullName: string, val: string): void {
    const user = event.fromUser;

    if (!user) {
      return event.reply(`Sorry, I couldn't find your user!`);
    }

    const [compName, prefName] = fullName.split(/\./);

    const errNoPrefs = `<${compName}> does not appear to have preferences`;

    let component;
    try {
      component = this.hub.componentNamed(compName);
    } catch {
      event.reply(errNoPrefs);
    }

    if (!component) return;
    if (!component.prefs) return;

    component.prefs.setPreference(user, prefName, val, event);
  }
}

Commando.registerListener('set-prefs', {
  klass: PrefsReactor,
  match: /^set my\s/,
  handler: function(event) {
    const part = '[-_a-z0-9]+';
    const re = new RegExp(
      `^set\\s+my\\s+` + // set my
      `(${part}\\.${part})` + // component.value
        `\\s+to\\s+(.*)`, // to $value
      'i'
    );

    const match = event.text.match(re);

    if (!match) return;

    return this.setPref(event, match[1], match[2]);
  },
});

Commando.registerListener('dump-prefs', {
  klass: PrefsReactor,
  match: /^(dump|show)\s+my\s+(pref(erence)?s|setttings)/,
  handler: function(event) {
    const user = event.fromUser;
    if (!user) return;

    const hub = this.hub;

    const prefStrings = [];

    for (const component of [
      hub.userDirectory,
      Object.values(hub.channels),
      Object.values(hub.reactors),
    ].flat()) {
      if (!component.prefs) continue;

      for (const name of component.prefs.prefNames) {
        prefStrings.push(component.prefs.describeUserPref(user, name));
      }
    }

    event.reply(
      `Preferences for ${user.username}:\n\n${prefStrings.join('\n')}`
    );
  },
});
