/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';

import { Connection } from './connection.dfdb';
import { BasicConstants } from './constants.dfdb';

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
    public connect(dbname: string, dbpath: string, options: any = null): Promise<Connection> {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }

        return new Promise<Connection>((resolve: (conn: Connection) => void, reject: (err: string) => void) => {
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            if (!this._connections[key]) {
                this._connections[key] = new Connection(dbname, dbpath, options);
                this._connections[key].connect().then((connected: boolean) => {
                    /** @todo check if 'connected' should be checked. */
                    resolve(this._connections[key]);
                }).catch((error: string) => {
                    reject(error);
                });
            } else {
                resolve(this._connections[key]);
            }
        });
    }
    public dropDatabase(dbname: string, dbpath: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let validation: any = null;
            let errors: string = null;
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);

            Connection.IsValidDatabase(dbname, dbpath)
                .then((results: any) => {
                    if (results.exists && results.valid) {
                        if (typeof this._connections[key] !== 'undefined') {
                            delete this._connections[key];
                        }

                        fs.unlinkSync(dbFullPath);

                        resolve();
                    } else {
                        reject(results.error);
                    }
                })
                .catch(reject);
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
