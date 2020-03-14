import * as moment from 'moment-timezone';
import * as sqlite from 'sqlite3';

// compat shim
interface Database {
  get: (...args) => void;
  run: (...args) => void;
  each: (
    stmt: string,
    rowCb: (err, row) => void,
    doneCb: (err, row) => void
  ) => void;
}

import Logger from './logger';
import { Preferences } from './preferences';
import User from './user';

export default class UserDirectory {
  private _users: Record<string, User>;
  private ready: boolean;
  db: Database;
  prefs: Preferences;
  name = 'UserDirectory';

  constructor(config) {
    this._users = {};
    this.db = new sqlite.Database(config.state_dbfile);
    this.ready = false;
    this.prefs = new Preferences(this, 'user');

    this.setUpPrefs();
  }

  async isReady(): Promise<void> {
    if (this.ready) return Promise.resolve();

    await this.loadUsersFromDb();
    await this.fetchState();

    this.ready = true;
    return Promise.resolve();
  }

  // obviously, should not belong here
  saveState(): void {
    const data = JSON.stringify({ preferences: this.prefs });
    this.db.run(
      'INSERT OR REPLACE INTO synergy_state (reactor_name, stored_at, json) VALUES (?, ?, ?)',
      'users',
      Math.floor(Date.now() / 1000),
      data
    );
  }

  // eslint-disable-next-line require-await
  async fetchState(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT json FROM synergy_state WHERE reactor_name = ?',
        'users',
        (err, row) => {
          if (err) return reject(err);

          this.prefs.load(JSON.parse(row.json));
          resolve();
        }
      );
    });
  }

  // eslint-disable-next-line require-await
  async loadUsersFromDb(): Promise<void> {
    // this is a wrapper around this.db.each that returns promises
    const genPromise = (stmt: string, cb: (row) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        this.db.each(
          stmt,
          (err, row) => {
            if (err) return reject(err);

            cb(row);
          },
          () => {
            resolve();
          }
        );
      });
    };

    const loadUsers = genPromise('SELECT * FROM users', row => {
      const username = row.username;
      this._users[username] = new User({ ...row, directory: this });
    });

    const loadIdentities = genPromise(
      'SELECT * FROM user_identities',
      async row => {
        await loadUsers; // we must have loaded the users before we do this
        const username = row.username;
        const user = this._users[username];

        if (user) {
          user.addIdentity(row.identity_name, row.identity_value);
        } else {
          Logger.warn(`found identity for ${username}, but no matching user`);
        }
      }
    );

    return loadIdentities;
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
