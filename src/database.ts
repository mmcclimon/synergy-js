// this is a wrapper around sqlite3 that returns promises

import * as sqlite from 'sqlite3';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Database {
  private db;

  constructor(filename) {
    this.db = new sqlite.Database(filename);
  }

  run(sql: string, params?: Array<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err, _res) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  get(sql: string, params: Array<any>, cb: (row) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, function(err, row) {
        if (err) return reject(err);

        // maybe, this could just return a Promise<row>, but I think I like
        // all of these returning Promise<void> for consistency
        cb(row);
        resolve();
      });
    });
  }

  // callback called once per row, promise only resolves when everything
  // finishes
  each(sql: string, params: Array<any>, cb: (row) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.each(
        sql,
        params,
        function(err, row) {
          if (err) return reject(err);
          cb(row);
        },
        function() {
          resolve();
        }
      );
    });
  }
}
