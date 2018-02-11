"use strict";
/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connection_dfdb_1 = require("./connection.dfdb");
const constants_dfdb_1 = require("./constants.dfdb");
const fs = require("fs");
const path = require("path");
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
    connect(dbname, dbpath, options = null, done = null) {
        if (typeof options === 'function') {
            done = options;
            options = {};
        }
        else if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        if (typeof done !== 'function') {
            done = (connection) => { };
        }
        const key = DocsOnFileDB.BuildKey(dbpath, dbname);
        if (!this._connections[key]) {
            this._connections[key] = new connection_dfdb_1.Connection(dbname, dbpath, options);
            this._connections[key].connect((connected) => {
                done(this._connections[key]);
            });
        }
        else {
            done(this._connections[key]);
        }
    }
    dropDatabase(dbname, dbpath, done = null) {
        if (typeof done !== 'function') {
            done = (errors) => { };
        }
        let validation = null;
        let errors = null;
        const key = DocsOnFileDB.BuildKey(dbpath, dbname);
        const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
        connection_dfdb_1.Connection.IsValidDatabase(dbname, dbpath, (results) => {
            if (results.exists && results.valid) {
                if (typeof this._connections[key] !== 'undefined') {
                    delete this._connections[key];
                }
                fs.unlinkSync(dbFullPath);
                done(null);
            }
            else {
                done(results.error);
            }
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
