import Database from './database';
import Logger from './logger';
import UserDirectory from './user-directory';

export default class Environment {
  stateDb: Database;
  userDirectory: UserDirectory;
  private ready = false;

  constructor(config) {
    this.stateDb = new Database(config.state_dbfile);
    this.userDirectory = new UserDirectory(this);
  }

  async load(): Promise<boolean> {
    if (this.ready) {
      Logger.warn('tried to reload environment?');
      return true;
    }

    await this.maybeCreateStateTables();

    // we await here because other components might depend on userdir prefs
    await this.userDirectory.start();

    this.ready = true;
    return true;
  }

  private maybeCreateStateTables(): Promise<Array<void>> {
    const p1 = this.stateDb.run(`
      CREATE TABLE IF NOT EXISTS synergy_state (
        reactor_name TEXT PRIMARY KEY,
        stored_at INTEGER NOT NULL,
        json TEXT NOT NULL
      );
    `);

    const p2 = this.stateDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        lp_id TEXT,
        is_master INTEGER DEFAULT 0,
        is_virtual INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0
      );
    `);

    const p3 = this.stateDb.run(`
      CREATE TABLE IF NOT EXISTS user_identities (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        identity_name TEXT NOT NULL,
        identity_value TEXT NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
        CONSTRAINT constraint_username_identity UNIQUE (username, identity_name),
        UNIQUE (identity_name, identity_value)
      );
    `);

    return Promise.all([p1, p2, p3]);
  }

  saveState(ns: string, state: object): Promise<void> {
    const data = JSON.stringify(state);
    return this.stateDb.run(
      'INSERT OR REPLACE INTO synergy_state (reactor_name, stored_at, json) VALUES (?, ?, ?)',
      [ns, Math.floor(Date.now() / 1000), data]
    );
  }

  async fetchState(ns: string): Promise<any> {
    let data;
    await this.stateDb.get(
      'SELECT json FROM synergy_state WHERE reactor_name = ?',
      [ns],
      row => {
        if (!row) return;
        data = JSON.parse(row.json);
      }
    );

    return data;
  }
}
