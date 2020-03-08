const util = require('util');
const sqlite = require('sqlite3');
const User = require('./user.js');

module.exports = class UserDirectory {
  constructor(config) {
    this._users = {};
    this.db = new sqlite.Database(config.state_dbfile);
    this._ready = false;
  }

  async isReady() {
    if (this._ready) return Promise.resolve();

    await this.loadUsersFromDb();
  }

  // TODO: factor out this database nonsense
  async loadUsersFromDb() {
    return new Promise((resolve, reject) => {
      this.db.each(
        'SELECT * FROM users',
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const username = row.username;
          this._users[username] = new User({ ...row, directory: this });
        },
        () => {
          resolve();
        }
      );
    });
  }
};
