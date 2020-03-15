import SynergyEvent from './event';
import User from './user';

// for now
type PreferenceValue = string | number | boolean;

export type PreferenceSpec = {
  validator: (value: string, evt: SynergyEvent) => [string, PreferenceValue];
  describer?: (value: PreferenceValue) => string;
  help?: string | undefined;
  description?: string;
  afterSet?: (user: User, value: PreferenceValue) => void;
  default?: PreferenceValue | (() => PreferenceValue);
};

type StrictSpec = Required<PreferenceSpec> & { name: string };

// this should properly be elsewhere
interface HasState {
  name: string;
  saveState: () => void;
}

export type PrefData = Record<string, Record<string, PreferenceValue>>;

export class Preferences {
  ns: string;
  component: HasState;
  specs: Record<string, StrictSpec>;
  private prefs: PrefData;

  constructor(component: HasState, ns = component.name) {
    this.component = component;
    this.ns = ns;
    this.specs = {};
    this.prefs = {};
  }

  addPreference(name: string, spec: PreferenceSpec): void {
    const strict = {
      afterSet: spec.afterSet || ((): void => {}),
      describer:
        spec.describer || ((val): string => (val ? String(val) : '<undef>')),
      description: spec.description || name,
      help: spec.help,
      name: name,
      validator: spec.validator,
      default: spec.default || undefined,
    };

    this.specs[name] = strict;
  }

  get prefNames(): Array<string> {
    return Object.keys(this.specs);
  }

  private fullName(name: string): string {
    return `${this.ns}.${name}`;
  }

  setPreference(
    user,
    name: string,
    rawValue: string,
    event: SynergyEvent
  ): void {
    const spec = this.specs[name];
    const full = this.fullName(name);

    if (!spec) {
      event.reply(`Sorry, I don't know about the ${full} preference.`);
      return;
    }

    const [err, actual] = spec.validator(rawValue, event);

    if (err) {
      event.reply(
        `Hmm...I don't understand the value you gave for ${full}: ${err}.`
      );
      return;
    }

    // set pref here
    this._setUserPref(user, name, actual);

    spec.afterSet(user, actual);

    this.component.saveState();

    event.reply(`Your ${full} is now ${actual}`);
  }

  // here, we must have verified that this is valid
  private _setUserPref(user: User, name, val): void {
    const username = user.username;
    let userPrefs = this.prefs[username];

    if (!userPrefs) {
      userPrefs = {};
      this.prefs[username] = userPrefs;
    }

    userPrefs[name] = val;
  }

  getUserPreference(user: User, prefName: string): PreferenceValue {
    const spec = this.specs[prefName];
    const defaultValue =
      typeof spec.default === 'function' ? spec.default() : spec.default;

    const userPrefs = this.prefs[user.username];
    const got = userPrefs ? userPrefs[prefName] : false;

    return got ? got : defaultValue;
  }

  describeUserPref(user: User, prefName: string): string {
    const val = this.getUserPreference(user, prefName);
    const desc = this.specs[prefName].describer(val);
    return `${this.fullName(prefName)}: ${desc}`;
  }

  toJSON(): Record<string, Record<string, PreferenceValue>> {
    return this.prefs;
  }

  load(preferences: PrefData): void {
    this.prefs = preferences;
  }
}
