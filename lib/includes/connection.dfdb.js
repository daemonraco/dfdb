"use strict";
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_dfdb_1 = require("./constants.dfdb");
const manager_dfdb_1 = require("./manager.dfdb");
const collection_dfdb_1 = require("./collection.dfdb");
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
        this._collections = {};
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
    close(done = null) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected) {
            const collectionNames = Object.keys(this._collections);
            const run = () => {
                const collectionName = collectionNames.shift();
                if (collectionName) {
                    this._collections[collectionName].close(() => {
                        delete this._collections[collectionName];
                        run();
                    });
                }
                else {
                    this._connected = false;
                    manager_dfdb_1.DocsOnFileDB.instance().forgetConnection(this._dbName, this._dbPath);
                    this.save(done);
                }
            };
            run();
        }
        else {
            done();
        }
    }
    error() {
        return this._lastError !== null;
    }
    filePointer() {
        return this._dbFile;
    }
    forgetCollection(name) {
        let forgotten = false;
        if (typeof this._collections[name] !== 'undefined') {
            delete this._collections[name];
            forgotten = true;
        }
        return forgotten;
    }
    lastError() {
        return this._lastError;
    }
    collection(name, done) {
        if (done === null) {
            done = (collection) => { };
        }
        if (typeof this._collections[name] !== 'undefined') {
            done(this._collections[name]);
        }
        else {
            this._collections[name] = new collection_dfdb_1.Collection(name, this);
            this._collections[name].connect(() => {
                done(this._collections[name]);
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
    resetError() {
        this._lastError = null;
    }
}
exports.Connection = Connection;
