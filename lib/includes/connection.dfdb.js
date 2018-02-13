"use strict";
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const async_1 = require("async");
const JSZip = require("jszip");
const fs = require("fs");
const constants_dfdb_1 = require("./constants.dfdb");
const manager_dfdb_1 = require("./manager.dfdb");
const collection_dfdb_1 = require("./collection.dfdb");
class ConnectionSavingQueueResult {
    constructor() {
        this.error = null;
        this.data = null;
    }
}
exports.ConnectionSavingQueueResult = ConnectionSavingQueueResult;
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
    collection(name) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof this._collections[name] !== 'undefined') {
                resolve(this._collections[name]);
            }
            else {
                this._collections[name] = new collection_dfdb_1.Collection(name, this);
                this._collections[name].connect()
                    .then(() => {
                    resolve(this._collections[name]);
                })
                    .catch((err) => {
                    reject(err);
                });
            }
        });
    }
    connect() {
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it an empty directory?
            if (this.doesExist()) {
                this.internalConnect()
                    .then((c) => resolve(c))
                    .catch(reject);
            }
            else {
                this.createBasics()
                    .then(() => {
                    this.internalConnect()
                        .then((c) => resolve(c))
                        .catch(reject);
                })
                    .catch(reject);
            }
        });
    }
    connected() {
        return this._connected;
    }
    close() {
        return new es6_promise_1.Promise((resolve, reject) => {
            this.resetError();
            if (this._connected) {
                const collectionNames = Object.keys(this._collections);
                const run = () => {
                    const collectionName = collectionNames.shift();
                    if (collectionName) {
                        this._collections[collectionName].close()
                            .then(() => {
                            delete this._collections[collectionName];
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        this._connected = false;
                        manager_dfdb_1.DocsOnFileDB.Instance().forgetConnection(this._dbName, this._dbPath);
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                };
                run();
            }
            else {
                resolve();
            }
        });
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
    loadFile(zPath) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result) => resolve(result));
            }
        });
    }
    save() {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._dbFile
                    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                    .pipe(fs.createWriteStream(this._dbFullPath))
                    .on('finish', resolve);
            }
            else {
                resolve();
            }
        });
    }
    removeFile(zPath) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results) => resolve(results));
            }
        });
    }
    updateFile(zPath, data, skipPhysicalSave = false) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results) => resolve(results));
            }
        });
    }
    //
    // Protected methods.
    createBasics() {
        return new es6_promise_1.Promise((resolve, reject) => {
            const zip = new JSZip();
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', () => {
                resolve();
            });
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
    internalConnect() {
        this._connected = false;
        return new es6_promise_1.Promise((resolve, reject) => {
            fs.readFile(this._dbFullPath, (error, data) => {
                if (error) {
                    this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                    reject(this._lastError);
                }
                else {
                    JSZip.loadAsync(data).then((zip) => {
                        this._dbFile = zip;
                        this._connected = true;
                        this.setSavingQueue();
                        resolve(this._connected);
                    }).catch((error) => {
                        this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                        reject(this._lastError);
                    });
                }
            });
        });
    }
    resetError() {
        this._lastError = null;
    }
    setSavingQueue() {
        this._savingQueue = async_1.queue((task, next) => {
            const resutls = new ConnectionSavingQueueResult();
            switch (task.action) {
                case constants_dfdb_1.ConnectionSaveConstants.LoadFile:
                    const file = this._dbFile.file(task.path);
                    if (file !== null) {
                        file.async('text').then((data) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    }
                    else {
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.RemoveFile:
                    this._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.UpdateFile:
                    this._dbFile.file(task.path, task.data);
                    if (!task.skipPhysicalSave) {
                        this.save()
                            .then(() => {
                            next(resutls);
                        })
                            .catch((err) => next(resutls));
                    }
                    else {
                        next(resutls);
                    }
                    break;
                default:
                    resutls.error = `Unknown action '${task.action}'`;
                    next(resutls);
            }
        }, 1);
    }
    //
    // Protected methods.
    static IsValidDatabase(dbName, dbPath) {
        return new es6_promise_1.Promise((resolve, reject) => {
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
                        resolve(results);
                    }
                    else {
                        if (data.toString().substring(0, 2) === 'PK') {
                            results.valid = true;
                        }
                        else {
                            results.error = constants_dfdb_1.Errors.DatabaseNotValid;
                        }
                        resolve(results);
                    }
                });
            }
            else {
                results.error = constants_dfdb_1.Errors.DatabaseDoesntExist;
                resolve(results);
            }
        });
    }
}
exports.Connection = Connection;
