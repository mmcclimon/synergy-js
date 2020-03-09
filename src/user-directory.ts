import * as sqlite from 'sqlite3';

// compat shim
interface Database {
  each: (stmt: string, rowCb: (err, row) => void, doneCb: (err, row) => void) => void;
}

import { User } from './user';
import Logger from './logger';

export class UserDirectory {
  #users: Record<string, User>;
  #ready: boolean;
  db: Database;

  constructor(config) {
    this.#users = {};
    this.db = new sqlite.Database(config.state_dbfile);
    this.#ready = false;
  }

  async isReady(): Promise<void> {
    if (this.#ready) return Promise.resolve();

    await this.loadUsersFromDb();
    this.#ready = true;
    return Promise.resolve();
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
      this.#users[username] = new User({ ...row, directory: this });
    });

    const loadIdentities = genPromise(
      'SELECT * FROM user_identities',
      async row => {
        await loadUsers; // we must have loaded the users before we do this
        const username = row.username;
        const user = this.#users[username];

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
    return Object.values(this.#users).filter(u => !u.isDeleted);
  }

  userByChannelAndAddress(channelName: string, addr: string): User | undefined {
    for (const user of this.users) {
      const identity = user.identities[channelName];
      if (identity === addr) {
        return user;
      }
    }

    return undefined;
  }
}
