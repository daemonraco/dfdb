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
        this.connections = {};
    }
    //
    // Public methods.
    connect(dbname, dbpath, options = null, done = null) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            options = {};
        }
        if (typeof done !== 'function') {
            done = (connection) => { };
        }
        const key = `${dbpath}[${dbname}]`;
        if (!this.connections[key]) {
            this.connections[key] = new connection_dfdb_1.Connection(dbname, dbpath, options);
            this.connections[key].connect((connected) => {
                done(this.connections[key]);
            });
        }
        else {
            done(this.connections[key]);
        }
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
