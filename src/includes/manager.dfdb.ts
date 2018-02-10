/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Connection } from './connection.dfdb';

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

        const key = this.buildKey(dbpath, dbname);
        if (!this._connections[key]) {
            this._connections[key] = new Connection(dbname, dbpath, options);
            this._connections[key].connect((connected: boolean) => {
                done(this._connections[key]);
            });
        } else {
            done(this._connections[key]);
        }
    }
    public forgetConnection(dbname: string, dbpath: string): boolean {
        let forgotten = false;
        const key = this.buildKey(dbpath, dbname);

        if (typeof this._connections[key] !== 'undefined') {
            if (!this._connections[key].connected()) {
                delete this._connections[key];
                forgotten = true;
            }
        }

        return forgotten;
    }
    //
    // Protected methods.
    protected buildKey(dbname: string, dbpath: string): string {
        return `${dbpath}[${dbname}]`;
    }
    //
    // Public class methods.
    public static instance(): DocsOnFileDB {
        if (!this._instance) {
            this._instance = new DocsOnFileDB();
        }

        return this._instance;
    }
}
