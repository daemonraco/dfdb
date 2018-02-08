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
    protected connections: { [name: string]: Connection } = {};
    //
    // Constructor.
    protected constructor() {
    }
    //
    // Public methods.
    public connect(dbname: string, dbpath: string, options: any = null, done: any = null) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        if (typeof done !== 'function') {
            done = (connection: Connection) => { };
        }

        const key = `${dbpath}[${dbname}]`;
        if (!this.connections[key]) {
            this.connections[key] = new Connection(dbname, dbpath, options);
            this.connections[key].connect((connected: boolean) => {
                done(this.connections[key]);
            });
        } else {
            done(this.connections[key]);
        }
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
