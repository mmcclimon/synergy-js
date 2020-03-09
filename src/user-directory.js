const sqlite = require('sqlite3');
const User = require('./user.js');
const Logger = require('./logger.js');

module.exports = class UserDirectory {
  constructor(config) {
    this._users = {};
    this.db = new sqlite.Database(config.state_dbfile);
    this.db.serialize();
    this._ready = false;
  }

  async isReady() {
    if (this._ready) return Promise.resolve();

    await this.loadUsersFromDb();
    this._ready = true;
    return Promise.resolve();
  }

  // eslint-disable-next-line require-await
  async loadUsersFromDb() {
    // this is a wrapper around this.db.each that returns promises
    const genPromise = (stmt, cb) => {
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

    const loadIdentities = genPromise('SELECT * FROM user_identities', row => {
      const username = row.username;
      const user = this._users[username];

      if (user) {
        user.addIdentity(row.identity_name, row.identity_value);
      } else {
        Logger.warn(`found identity for ${username}, but no matching user`);
      }
    });

    return loadUsers.then(() => loadIdentities);
  }

  get users() {
    return Object.values(this._users).filter(u => !u.is_deleted);
  }

  userByChannelAndAddress(channelName, address) {
    for (const user of this.users) {
      const identity = user.identities[channelName];
      if (identity === address) {
        return user;
      }
    }

    return undefined;
  }
};
