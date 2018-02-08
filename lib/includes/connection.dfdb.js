"use strict";
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_dfdb_1 = require("./constants.dfdb");
const table_dfdb_1 = require("./table.dfdb");
const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
class Connection {
    constructor(dbName, dbPath, options = {}) {
        this._connected = false;
        this._dbFile = null;
        this._dbFullPath = null;
        this._dbName = null;
        this._dbPath = null;
        this._lastError = null;
        this._tables = {};
        this._dbName = dbName;
        this._dbPath = dbPath;
        this._dbFullPath = path.join(this._dbPath, `${this._dbName}${constants_dfdb_1.BasicConstants.DBExtension}`);
    }
    //
    // Public methods.
    connect(done) {
        if (typeof done !== 'function') {
            done = (connected) => { };
        }
        //
        // Is it an empty directory?
        if (this.doesExist()) {
            this.internalConnect(done);
        }
        else {
            this.createBasics(() => {
                this.internalConnect(done);
            });
        }
    }
    connected() {
        return this._connected;
    }
    error() {
        return this._lastError !== null;
    }
    filePointer() {
        return this._dbFile;
    }
    lastError() {
        return this._lastError;
    }
    table(name, done) {
        if (done === null) {
            done = (table) => { };
        }
        if (typeof this._tables[name] !== 'undefined') {
            done(this._tables[name]);
        }
        else {
            this._tables[name] = new table_dfdb_1.Table(name, this);
            this._tables[name].connect(() => {
                done(this._tables[name]);
            });
        }
    }
    save(done = null) {
        if (done === null) {
            done = () => { };
        }
        if (this._connected) {
            this._dbFile
                .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', done);
        }
        else {
            done();
        }
    }
    //
    // Protected methods.
    createBasics(done) {
        const zip = new JSZip();
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(this._dbFullPath))
            .on('finish', () => {
            done();
        });
    }
    doesExist() {
        let stat = null;
        try {
            stat = fs.statSync(this._dbFullPath);
        }
        catch (e) { }
        return stat !== null && stat.isFile();
    }
    internalConnect(done) {
        this._connected = false;
        fs.readFile(this._dbFullPath, (error, data) => {
            if (error) {
                this._lastError = `Unable to load ${this._dbFullPath}. ${error}`;
                done(this._connected);
            }
            else {
                JSZip.loadAsync(data).then((zip) => {
                    this._dbFile = zip;
                    this._connected = true;
                    done(this._connected);
                }).catch((error) => {
                    this._lastError = `Unable to load ${this._dbFullPath}. ${error}`;
                    done(this._connected);
                });
            }
        });
    }
}
exports.Connection = Connection;
