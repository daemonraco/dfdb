"use strict";
/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const fs = require("fs");
const path = require("path");
const connection_dfdb_1 = require("./connection.dfdb");
const constants_dfdb_1 = require("./constants.dfdb");
class DocsOnFileDB {
    //
    // Constructor.
    constructor() {
        //
        // Protected properties.
        this._connections = {};
    }
    //
    // Public methods.
    connect(dbname, dbpath, options = null) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        return new es6_promise_1.Promise((resolve, reject) => {
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            if (!this._connections[key]) {
                this._connections[key] = new connection_dfdb_1.Connection(dbname, dbpath, options);
                this._connections[key].connect().then((connected) => {
                    /** @todo check if 'connected' should be checked. */
                    resolve(this._connections[key]);
                }).catch((error) => {
                    reject(error);
                });
            }
            else {
                resolve(this._connections[key]);
            }
        });
    }
    dropDatabase(dbname, dbpath) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let validation = null;
            let errors = null;
            const key = DocsOnFileDB.BuildKey(dbpath, dbname);
            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
            connection_dfdb_1.Connection.IsValidDatabase(dbname, dbpath)
                .then((results) => {
                if (results.exists && results.valid) {
                    if (typeof this._connections[key] !== 'undefined') {
                        delete this._connections[key];
                    }
                    fs.unlinkSync(dbFullPath);
                    resolve();
                }
                else {
                    reject(results.error);
                }
            })
                .catch(reject);
        });
    }
    forgetConnection(dbname, dbpath) {
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
    static Instance() {
        if (!this._instance) {
            this._instance = new DocsOnFileDB();
        }
        return this._instance;
    }
    //
    // Protected class methods.
    static BuildKey(dbname, dbpath) {
        return `${dbpath}[${dbname}]`;
    }
    static GuessDatabasePath(dbName, dbPath) {
        return path.join(dbPath, `${dbName}${constants_dfdb_1.BasicConstants.DBExtension}`);
    }
}
exports.DocsOnFileDB = DocsOnFileDB;
