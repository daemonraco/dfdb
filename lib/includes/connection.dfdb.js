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
/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
class ConnectionSavingQueueResult {
    constructor() {
        this.error = null;
        this.data = null;
    }
}
exports.ConnectionSavingQueueResult = ConnectionSavingQueueResult;
/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
class ConnectionDBValidationResult {
    constructor() {
        this.exists = false;
        this.valid = false;
        this.error = null;
    }
}
exports.ConnectionDBValidationResult = ConnectionDBValidationResult;
/**
 * This class represents an active connection to a database on file.
 *
 * @class Connection
 */
class Connection {
    /**
     * @constructor
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     */
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
    /**
     * Provides access to a collection inside current database connection. If such
     * collection doesn't exist, it is created.
     *
     * @method collection
     * @param {string} name Collection to look for.
     * @returns {Promise<Collection>} Returns a connection as a promise.
     */
    collection(name) {
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a known collection?
            if (typeof this._collections[name] !== 'undefined') {
                //
                // Resolving from cache.
                resolve(this._collections[name]);
            }
            else {
                //
                // Creating a proper collection object.
                this._collections[name] = new collection_dfdb_1.Collection(name, this);
                //
                // Starting collection connector.
                this._collections[name].connect()
                    .then(() => {
                    resolve(this._collections[name]);
                })
                    .catch(reject);
            }
        });
    }
    /**
     * Connects this object to the physicial database file. If the database file
     * doesn't exist it is created.
     *
     * @method connect
     * @returns {Promise<void>} Returns TRUE or FALSE as a promise indicating
     * if it's connected or not.
     */
    connect() {
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Does it exist?
            if (this.doesExist()) {
                //
                // Actually connecting.
                this.internalConnect()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                //
                // Creating basic stuff of a database.
                this.createBasics()
                    .then(() => {
                    //
                    // Actually connecting.
                    this.internalConnect()
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
        });
    }
    /**
     * Provides access to the connection status.
     *
     * @method connected
     * @returns {boolean} Returns TRUE when it's connected.
     */
    connected() {
        return this._connected;
    }
    /**
     * Closes current connection, but first it closes all its collections and also
     * saves all pending changes.
     *
     * @method close
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    close() {
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is is connected?
            if (this._connected) {
                //
                // List of names of all cached collections.
                const collectionNames = Object.keys(this._collections);
                //
                // Recursive executor.
                const run = () => {
                    //
                    // Picking a collection name.
                    const collectionName = collectionNames.shift();
                    //
                    // Is there a name to process.
                    if (collectionName) {
                        //
                        // Closing a collection.
                        this._collections[collectionName].close()
                            .then(() => {
                            //
                            // Forgetting collection.
                            delete this._collections[collectionName];
                            //
                            // Running the next step.
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        //
                        // Saving all changes.
                        this.save()
                            .then(() => {
                            //
                            // Setting this connection as not connected.
                            this._connected = false;
                            //
                            // Asking manager to forget this connection.
                            manager_dfdb_1.DocsOnFileDB.Instance().forgetConnection(this._dbName, this._dbPath);
                            resolve();
                        })
                            .catch(reject);
                    }
                };
                run();
            }
            else {
                //
                // When it's not connected it's immediately resolved.
                resolve();
            }
        });
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error() {
        return this._lastError !== null;
    }
    /**
     * Ask this connection to forget a tracked collection.
     *
     * @method forgetCollection
     * @param {string} name Collection name.
     * @returns {boolean} Returns TRUE when it was forgotten.
     */
    forgetCollection(name) {
        //
        // Default values.
        let forgotten = false;
        //
        // Is it tracked?
        if (typeof this._collections[name] !== 'undefined') {
            //
            // Forgetting.
            delete this._collections[name];
            forgotten = true;
        }
        return forgotten;
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError() {
        return this._lastError;
    }
    /**
     * This method centralizes all calls to load a file from inside the database
     * zip file.
     *
     * @method loadFile
     * @param {string} zPath Internal path to load.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    loadFile(zPath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // is it connected?
            if (this._connected) {
                //
                // Piling up a new zip access operation to read a file.
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result) => resolve(result));
            }
            else {
                //
                // It should be connected to actually save.
                this._lastError = constants_dfdb_1.Errors.DatabaseNotConnected;
                reject(this._lastError);
            }
        });
    }
    /**
     * Thi method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    save() {
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Physcally saving.
                this._dbFile
                    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                    .pipe(fs.createWriteStream(this._dbFullPath))
                    .on('finish', resolve);
            }
            else {
                //
                // It should be connected to actually save.
                this._lastError = constants_dfdb_1.Errors.DatabaseNotConnected;
                reject(this._lastError);
            }
        });
    }
    /**
     * This method centralizes all calls to remove a file from inside the database
     * zip file.
     *
     * @method removeFile
     * @param {string} zPath Internal path to remove.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    removeFile(zPath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Piling up a new zip access operation to remove a file.
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this._lastError = constants_dfdb_1.Errors.DatabaseNotConnected;
                reject(this._lastError);
            }
        });
    }
    /**
     * This method centralizes all calls to update contents of a file inside the
     * database zip file.
     *
     * @method updateFile
     * @param {string} zPath Internal path to remove.
     * @param {any} data Information to be stored.
     * @param {boolean} skipPhysicalSave After virtually updating the file, should
     * physical storage be updated?
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    updateFile(zPath, data, skipPhysicalSave = false) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                this._savingQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this._lastError = constants_dfdb_1.Errors.DatabaseNotConnected;
                reject(this._lastError);
            }
        });
    }
    //
    // Protected methods.
    createBasics() {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            const zip = new JSZip();
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', () => {
                resolve();
            });
        });
    }
    /**
     * This method checks if current connection's zip file exists or not.
     *
     * @method doesExist
     * @returns {boolean} Returns TRUE when it does.
     */
    doesExist() {
        let stat = null;
        try {
            stat = fs.statSync(this._dbFullPath);
        }
        catch (e) { }
        return stat !== null && stat.isFile();
    }
    /**
     * This method makes the acutal physical connection to this connection's zip
     * file.
     *
     * @method internalConnect
     * @returns {Promise<void>} Returns TRUE or FALSE as a promise indicating
     * if it's connected or not.
     */
    internalConnect() {
        this._connected = false;
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Physically reading the file.
            fs.readFile(this._dbFullPath, (error, data) => {
                //
                // Did it fail?
                if (error) {
                    //
                    // Rejecting promise.
                    this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                    reject(this._lastError);
                }
                else {
                    //
                    // Parsing data as a zip file.
                    JSZip.loadAsync(data).then((zip) => {
                        //
                        // Zip file shortcut.
                        this._dbFile = zip;
                        this._connected = true;
                        //
                        // Starting the queue that centralizes all file accesses.
                        this.setSavingQueue();
                        resolve();
                    }).catch((error) => {
                        this._lastError = `${constants_dfdb_1.Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                        reject(this._lastError);
                    });
                }
            });
        });
    }
    /**
     * This method cleans up current error messages.
     *
     * @method resetError
     */
    resetError() {
        this._lastError = null;
    }
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @method setSavingQueue
     */
    setSavingQueue() {
        //
        // Creating a new queue.
        // @note It only allow 1 (one) access at a time.
        this._savingQueue = async_1.queue((task, next) => {
            //
            // Default values.
            const resutls = new ConnectionSavingQueueResult();
            //
            // What action should it attend?
            switch (task.action) {
                case constants_dfdb_1.ConnectionSaveConstants.LoadFile:
                    //
                    // Retrieving file from zip.
                    const file = this._dbFile.file(task.path);
                    //
                    // Does it exist?
                    if (file !== null) {
                        //
                        // Parsing and returning its connents.
                        file.async('text').then((data) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    }
                    else {
                        //
                        // Setting an error message and responding.
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.RemoveFile:
                    //
                    // Removing a file from zip.
                    this._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.UpdateFile:
                    //
                    // Updating file's contents. If it doesn't exist, it is
                    // created.
                    this._dbFile.file(task.path, task.data);
                    //
                    // Should the physical file be updated?
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
                    //
                    // At this point, the requested action can't be attended.
                    resutls.error = `Unknown action '${task.action}'`;
                    next(resutls);
            }
        }, 1);
    }
    //
    // Public class methods.
    /**
     * This method takes the basic values that represent a database and checks if
     * it exists and if it's valid or not.
     *
     * @method IsValidDatabase
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {Promise<ConnectionDBValidationResult>}
     */
    static IsValidDatabase(dbname, dbpath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Default values.
            const results = new ConnectionDBValidationResult();
            //
            // Guessing database zip file's full path.
            const dbFullPath = manager_dfdb_1.DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
            //
            // Checking its existence.
            let stat = null;
            try {
                stat = fs.statSync(dbFullPath);
            }
            catch (e) { }
            //
            // Does it exist?
            if (stat) {
                results.exists = true;
                //
                // Loading its information for further analysis.
                fs.readFile(dbFullPath, (error, data) => {
                    //
                    // Was it read?
                    if (error) {
                        results.error = constants_dfdb_1.Errors.DatabaseDoesntExist;
                        resolve(results);
                    }
                    else {
                        //
                        // Does the header indicates it's a zip file?
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
