"use strict";
/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connection_dfdb_1 = require("./connection.dfdb");
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
        const key = this.buildKey(dbpath, dbname);
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
    forgetConnection(dbname, dbpath) {
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
    buildKey(dbname, dbpath) {
        return `${dbpath}[${dbname}]`;
    }
    //
    // Public class methods.
    static instance() {
        if (!this._instance) {
            this._instance = new DocsOnFileDB();
        }
        return this._instance;
    }
}
exports.DocsOnFileDB = DocsOnFileDB;
