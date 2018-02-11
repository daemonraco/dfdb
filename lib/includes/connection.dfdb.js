"use strict";
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_dfdb_1 = require("./constants.dfdb");
const manager_dfdb_1 = require("./manager.dfdb");
const collection_dfdb_1 = require("./collection.dfdb");
const async_1 = require("async");
const JSZip = require("jszip");
const fs = require("fs");
class Connection {
    constructor(dbName, dbPath, options = {}) {
        this._collections = {};
        this._connected = false;
        this._dbFile = null;
        this._dbFullPath = null;
        this._dbName = null;
        this._dbPath = null;
        this._lastError = null;
        this._savingQueue = null;
        this._dbName = dbName;
        this._dbPath = dbPath;
        this._dbFullPath = manager_dfdb_1.DocsOnFileDB.GuessDatabasePath(this._dbName, this._dbPath);
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
                    manager_dfdb_1.DocsOnFileDB.Instance().forgetConnection(this._dbName, this._dbPath);
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
    loadFile(zPath, done) {
        if (done === null) {
            done = (error, data) => { };
        }
        if (this._connected) {
            this._savingQueue.push({
                action: constants_dfdb_1.ConnectionSaveConstants.LoadFile,
                path: zPath
            }, done);
        }
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
    removeFile(zPath, done) {
        if (done === null) {
            done = (error) => { };
        }
        if (this._connected) {
            this._savingQueue.push({
                action: constants_dfdb_1.ConnectionSaveConstants.RemoveFile,
                path: zPath
            }, done);
        }
    }
    updateFile(zPath, data, done, skipPhysicalSave = false) {
        if (done === null) {
            done = (error) => { };
        }
        if (this._connected) {
            this._savingQueue.push({
                action: constants_dfdb_1.ConnectionSaveConstants.UpdateFile,
                path: zPath,
                data, skipPhysicalSave
            }, done);
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
                this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                done(this._connected);
            }
            else {
                JSZip.loadAsync(data).then((zip) => {
                    this._dbFile = zip;
                    this._connected = true;
                    this.setSavingQueue();
                    done(this._connected);
                }).catch((error) => {
                    this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                    done(this._connected);
                });
            }
        });
    }
    resetError() {
        this._lastError = null;
    }
    setSavingQueue() {
        this._savingQueue = async_1.queue((task, next) => {
            switch (task.action) {
                case constants_dfdb_1.ConnectionSaveConstants.LoadFile:
                    const file = this._dbFile.file(task.path);
                    if (file !== null) {
                        file.async('text').then((data) => {
                            next(null, data);
                        });
                    }
                    else {
                        next(`Zip path '${task.path}' does not exist`, null);
                    }
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.RemoveFile:
                    this._dbFile.remove(task.path);
                    next(null);
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.UpdateFile:
                    this._dbFile.file(task.path, task.data);
                    if (!task.skipPhysicalSave) {
                        this.save(() => {
                            next(null);
                        });
                    }
                    else {
                        next(null);
                    }
                    break;
                default:
                    next(`Unknown action '${task.action}'`);
            }
        }, 1);
    }
    //
    // Protected methods.
    static IsValidDatabase(dbName, dbPath, done) {
        const results = {
            exists: false,
            valid: false,
            error: null
        };
        const dbFullPath = manager_dfdb_1.DocsOnFileDB.GuessDatabasePath(dbName, dbPath);
        let stat = null;
        try {
            stat = fs.statSync(dbFullPath);
        }
        catch (e) { }
        if (stat) {
            results.exists = true;
            fs.readFile(dbFullPath, (error, data) => {
                if (error) {
                    results.error = constants_dfdb_1.Errors.DatabaseDoesntExist;
                    done(results);
                }
                else {
                    if (data.toString().substring(0, 2) === 'PK') {
                        results.valid = true;
                    }
                    else {
                        results.error = constants_dfdb_1.Errors.DatabaseNotValid;
                    }
                    done(results);
                }
            });
        }
        else {
            results.error = constants_dfdb_1.Errors.DatabaseDoesntExist;
            done(results);
        }
    }
}
exports.Connection = Connection;
