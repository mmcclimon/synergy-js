const util = require('util');
const sqlite = require('sqlite3');
const User = require('./user.js');

module.exports = class UserDirectory {
  constructor(config) {
    this._users = {};
    this.db = null;
    this.isReady = false;

    this.loadUsersFromDb(config.state_dbfile);
  }

  // TODO: factor out this database nonsense
  // XXX: potentially racy. Eventually this should all be dealt with
  //      asynchronously. (It is, now, but pretends not to be.
  loadUsersFromDb(filename) {
    this.db = new sqlite.Database(filename);

    this.db.each(
      'SELECT * FROM users',
      (err, row) => {
        const username = row.username;
        this._users[username] = new User({ ...row, directory: this });
      },
      () => {
        this.isReady = true; // gross.
      },
    );
  }
};
