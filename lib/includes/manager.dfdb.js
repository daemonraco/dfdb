"use strict";
/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const fs = require("fs");
const path = require("path");
const constants_dfdb_1 = require("./constants.dfdb");
const connection_dfdb_1 = require("./connection/connection.dfdb");
const rejection_dfdb_1 = require("./rejection.dfdb");
/**
 * Central manager for all connection.
 *
 * @class DocsOnFileDB
 */
class DocsOnFileDB {
    //
    // Constructor.
    /**
     * @constructor
     */
    constructor() {
        //
        // Protected properties.
        this._connections = {};
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this manager.
         */
        this.toString = () => {
            return `DocsOnFileDB[manager]`;
        };
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
    connect(dbname, dbpath, options = null) {
        //
        // Checking and fixing options.
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Getting a key to identify the requested connection.
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            //
            // Is it a known connection?
            if (typeof this._connections[key] === 'undefined') {
                //
                // Creating a proper connection object.
                this._connections[key] = new connection_dfdb_1.Connection(dbname, dbpath, options);
                //
                // Starting connection.
                this._connections[key].connect()
                    .then(() => {
                    resolve(this._connections[key]);
                })
                    .catch(reject);
            }
            else {
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
    dropDatabase(dbname, dbpath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            let validation = null;
            let errors = null;
            //
            // Getting a key to identify the requested connection.
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            //
            // Guessing the full path of the requested database.
            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
            //
            // Checking if given parameters point to a valid and existing
            // database.
            connection_dfdb_1.Connection.IsValidDatabase(dbname, dbpath)
                .then((results) => {
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
                }
                else {
                    reject(new rejection_dfdb_1.Rejection(results.errorCode, results));
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
    forgetConnection(dbname, dbpath) {
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
        }
        else {
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
    static Instance() {
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
    static BuildKey(dbname, dbpath) {
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
    static GuessDatabasePath(dbname, dbpath) {
        return path.join(dbpath, `${dbname}${constants_dfdb_1.BasicConstants.DBExtension}`);
    }
}
exports.DocsOnFileDB = DocsOnFileDB;
