/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Connection } from './connection.dfdb';
import { BasicConstants } from './constants.dfdb';
import * as fs from 'fs';
import * as path from 'path';

export class DocsOnFileDB {
    //
    // Class private properties.
    private static _instance: DocsOnFileDB;
    //
    // Protected properties.
    protected _connections: { [name: string]: Connection } = {};
    //
    // Constructor.
    protected constructor() {
    }
    //
    // Public methods.
    public connect(dbname: string, dbpath: string, options: any = null, done: any = null) {
        if (typeof options === 'function') {
            done = options;
            options = {};
        } else if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        if (typeof done !== 'function') {
            done = (connection: Connection) => { };
        }

        const key = DocsOnFileDB.BuildKey(dbpath, dbname);
        if (!this._connections[key]) {
            this._connections[key] = new Connection(dbname, dbpath, options);
            this._connections[key].connect((connected: boolean) => {
                done(this._connections[key]);
            });
        } else {
            done(this._connections[key]);
        }
    }
    public dropDatabase(dbname: string, dbpath: string, done: any = null) {
        if (typeof done !== 'function') {
            done = (errors: string) => { };
        }

        let validation: any = null;
        let errors: string = null;
        const key = DocsOnFileDB.BuildKey(dbpath, dbname);
        const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);

        Connection.IsValidDatabase(dbname, dbpath, (results: any) => {
            if (results.exists && results.valid) {
                if (typeof this._connections[key] !== 'undefined') {
                    delete this._connections[key];
                }

                fs.unlinkSync(dbFullPath);

                done(null);
            } else {
                done(results.error);
            }
        });
    }
    public forgetConnection(dbname: string, dbpath: string): boolean {
        let forgotten = false;
        const key = DocsOnFileDB.BuildKey(dbpath, dbname);

        if (typeof this._connections[key] !== 'undefined') {
            if (!this._connections[key].connected()) {
                delete this._connections[key];
                forgotten = true;
            }
        }

        return forgotten;
    }

    //
    // Public class methods.
    public static Instance(): DocsOnFileDB {
        if (!this._instance) {
            this._instance = new DocsOnFileDB();
        }

        return this._instance;
    }

    //
    // Protected class methods.
    protected static BuildKey(dbname: string, dbpath: string): string {
        return `${dbpath}[${dbname}]`;
    }
    public static GuessDatabasePath(dbName: string, dbPath: string): string {
        return path.join(dbPath, `${dbName}${BasicConstants.DBExtension}`);
    }
}
