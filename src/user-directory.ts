import * as moment from 'moment-timezone';

import Environment from './environment';
import Logger from './logger';
import { Preferences } from './preferences';
import User from './user';

export default class UserDirectory {
  private _users: Record<string, User>;
  private ready: boolean;
  env: Environment;
  prefs: Preferences;
  name = 'UserDirectory';

  constructor(env: Environment) {
    this._users = {};
    this.ready = false;
    this.env = env;
    this.prefs = new Preferences(this, 'user');

    this.setUpPrefs();
  }

  async start(): Promise<void> {
    await this.loadUsersFromDb();
    return this.fetchState();
  }

  // obviously, should not belong here
  saveState(): Promise<void> {
    const data = JSON.stringify({ preferences: this.prefs });
    return this.env.stateDb.run(
      'INSERT OR REPLACE INTO synergy_state (reactor_name, stored_at, json) VALUES (?, ?, ?)',
      ['users', Math.floor(Date.now() / 1000), data]
    );
  }

  fetchState(): Promise<void> {
    return this.env.stateDb.get(
      'SELECT json FROM synergy_state WHERE reactor_name = ?',
      ['users'],
      row => {
        this.prefs.load(JSON.parse(row.json));
      }
    );
  }

  async loadUsersFromDb(): Promise<void> {
    await this.env.stateDb.each('SELECT * FROM users', [], row => {
      const username = row.username;
      this._users[username] = new User({ ...row, directory: this });
    });

    return this.env.stateDb.each('SELECT * FROM user_identities', [], row => {
      const username = row.username;
      const user = this._users[username];

      if (user) {
        user.addIdentity(row.identity_name, row.identity_value);
      } else {
        Logger.warn(`found identity for ${username}, but no matching user`);
      }
    });
  }

  get users(): Array<User> {
    return Object.values(this._users).filter(u => !u.isDeleted);
  }

  resolveName(name: string, resolvingUser?: User): User | undefined {
    if (!name) return;

    name = name.toLowerCase().replace(/^@/, '');

    if (name === 'me' || name === 'my' || name === 'myself' || name === 'i') {
      return resolvingUser;
    }

    const user = this._users[name];

    // TODO: nicknames

    return user;
  }

  userByChannelAndAddress(channelName: string, addr: string): User | undefined {
    for (const user of this.users) {
      const identity = user.identities[channelName];
      if (identity === addr) {
        return user;
      }
    }

    return;
  }

  setUpPrefs(): void {
    const p = this.prefs;

    p.addPreference('time-zone', {
      validator: (val, evt): [string, string] => {
        const isValid = !!moment.tz.zone(val);

        return isValid
          ? [undefined, val]
          : [`${val} is not a valid time zone name`, undefined];
      },
    });
  }
}
