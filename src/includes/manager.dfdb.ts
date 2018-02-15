/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as fs from 'fs';
import * as path from 'path';

import { Connection, ConnectionDBValidationResult } from './connection.dfdb';
import { BasicConstants } from './constants.dfdb';

/**
 * Central manager for all connection.
 *
 * @class DocsOnFileDB
 */
export class DocsOnFileDB {
    //
    // Class private properties.
    private static _instance: DocsOnFileDB;
    //
    // Protected properties.
    protected _connections: { [name: string]: Connection } = {};
    //
    // Constructor.
    /**
     * @constructor
     */
    protected constructor() {
    }
    //
    // Public methods.
    /**
     * Provides access to a database connection. In case the requested database
     * is already connected, it returns the same connection.
     *
     * @method connect
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     * @returns {Promise<Connection>} Returns a connection as a promise.
     */
    public connect(dbname: string, dbpath: string, options: any = null): Promise<Connection> {
        //
        // Checking and fixing options.
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        //
        // Building promise to return.
        return new Promise<Connection>((resolve: (conn: Connection) => void, reject: (err: string) => void) => {
            //
            // Getting a key to identify the requested connection.
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            //
            // Is it a known connection?
            if (typeof this._connections[key] === 'undefined') {
                //
                // Creating a proper connection object.
                this._connections[key] = new Connection(dbname, dbpath, options);
                //
                // Starting connection.
                this._connections[key].connect()
                    .then(() => {
                        resolve(this._connections[key]);
                    })
                    .catch(reject);
            } else {
                //
                // Resolving with a previously loaded connection.
                resolve(this._connections[key]);
            }
        });
    }
    /**
     * Provides a way to dispose of an existing database
     *
     * @method dropDatabase
     * @param {string} dbname Name of the database to delete.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {Promise<void>} Returns a promise to indicate when the operation
     * finishes.
     */
    public dropDatabase(dbname: string, dbpath: string): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let validation: any = null;
            let errors: string = null;
            //
            // Getting a key to identify the requested connection.
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            //
            // Guessing the full path of the requested database.
            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
            //
            // Checking if given parameters point to a valid and existing
            // database.
            Connection.IsValidDatabase(dbname, dbpath)
                .then((results: ConnectionDBValidationResult) => {
                    //
                    // Should it be removed?
                    if (results.exists && results.valid) {
                        //
                        // Cleaning known connections if any.
                        if (typeof this._connections[key] !== 'undefined') {
                            delete this._connections[key];
                        }
                        //
                        // Removing file.
                        fs.unlinkSync(dbFullPath);
                        //
                        // Resolving promise.
                        resolve();
                    } else {
                        reject(results.error);
                    }
                })
                .catch(reject);
        });
    }
    /**
     * Ask this manager to forget a tracked connection.
     *
     * @method forgetConnection
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {boolean} Returns TRUE when it was forgotten.
     */
    public forgetConnection(dbname: string, dbpath: string): boolean {
        //
        // Default values.
        let forgotten = false;
        //
        // Getting a key to identify the requested connection.
        const key = DocsOnFileDB.BuildKey(dbpath, dbname);
        //
        // Is it known?
        if (typeof this._connections[key] !== 'undefined') {
            //
            // Is it disconnected?
            if (!this._connections[key].connected()) {
                //
                // Forguetting.
                delete this._connections[key];
                forgotten = true;
            }
        } else {
            //
            // If it's not known, it's considered as forgotten.
            forgotten = true;
        }

        return forgotten;
    }

    //
    // Public class methods.
    /**
     * This class method provides access to this manager's single instance.
     *
     * @static
     * @method Instance
     * @returns {DocsOnFileDB} Singleton's instance.
     */
    public static Instance(): DocsOnFileDB {
        //
        // Is this the first invocation?
        if (!this._instance) {
            //
            // Creating the sole instance.
            this._instance = new DocsOnFileDB();
        }

        return this._instance;
    }

    //
    // Protected class methods.
    /**
     * Takes basic identifiers of a database and builds a key for indexation.
     *
     * @static
     * @method BuildKey
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {string}
     */
    protected static BuildKey(dbname: string, dbpath: string): string {
        return `${dbpath}[${dbname}]`;
    }
    /**
     * Takes basic identifiers of a database and guesses its full path.
     *
     * @static
     * @method GuessDatabasePath
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {string}
     */
    public static GuessDatabasePath(dbname: string, dbpath: string): string {
        return path.join(dbpath, `${dbname}${BasicConstants.DBExtension}`);
    }
}
