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
const collection_dfdb_1 = require("./collection/collection.dfdb");
const rejection_dfdb_1 = require("./rejection.dfdb");
const rejection_codes_dfdb_1 = require("./rejection-codes.dfdb");
const tools_dfdb_1 = require("./tools.dfdb");
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
        this.errorCode = null;
    }
}
exports.ConnectionDBValidationResult = ConnectionDBValidationResult;
/**
 * This class represents an active connection to a database on file.
 *
 * @class Connection
 */
class Connection {
    //
    // Constructor.
    /**
     * @constructor
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     */
    constructor(dbName, dbPath, options = {}) {
        //
        // Protected properties.
        this._collections = {};
        this._connected = false;
        this._dbFile = null;
        this._dbFullPath = null;
        this._dbName = null;
        this._dbPath = null;
        this._fileAccessQueue = null;
        this._lastError = null;
        this._lastRejection = null;
        this._manifest = {
            collections: {}
        };
        this._manifestPath = null;
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this connection.
         */
        this.toString = () => {
            return `connection:${this._dbName}[${this._dbPath}]`;
        };
        //
        // Shortcuts.
        this._dbName = dbName;
        this._dbPath = dbPath;
        //
        // Main paths.
        this._manifestPath = `manifest`;
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
        //
        // Restarting error messages.
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
                // Anonymous function to actually handle the collection loading.
                const loadCollection = () => {
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
                };
                //
                // Is it a known collection?
                if (typeof this._manifest.collections[name] === 'undefined') {
                    //
                    // Adding it as known.
                    this._manifest.collections[name] = {
                        name,
                        type: constants_dfdb_1.CollectionTypes.Simple
                    };
                    //
                    // Saving changes before loading.
                    this.save()
                        .then(loadCollection)
                        .catch(reject);
                }
                else {
                    //
                    // If it's known, it's get immediately loaded.
                    loadCollection();
                }
            }
        });
    }
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {{ [name: string]: any }} Returns a list of collections this connection knows.
     */
    collections() {
        //
        // Returning a deep-copy to avoid unintentional changes.
        return tools_dfdb_1.Tools.DeepCopy(this._manifest.collections);
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
        //
        // Restarting error messages.
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
        //
        // Restarting error messages.
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
     * @param {boolean} drop Forgetting a collection is simple assuming that it's
     * not loaded, but it will still have an entry in the manifest. This parameter
     * forces this connection to completelly forget it.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    forgetCollection(name, drop = false) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it tracked?
            if (typeof this._collections[name] !== 'undefined') {
                //
                // Forgetting.
                delete this._collections[name];
                //
                // Should it completelly forget it?
                if (drop) {
                    //
                    // Forgetting.
                    delete this._manifest.collections[name];
                    //
                    // Saving changes.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
                else {
                    resolve();
                }
            }
            else {
                //
                // If it's not tracked, nothing is done.
                resolve();
            }
        });
    }
    /**
     * Provides a way to know if this connection stores certain collection.
     *
     * @method hasCollection
     * @param {string} name Name of the collection to check.
     * @returns {boolean} Returns TRUE when it does.
     */
    hasCollection(name) {
        return typeof this._manifest.collections[name] !== 'undefined';
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
                this._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result) => resolve(result));
            }
            else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._lastRejection);
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
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Updating internal manifest file's contents. If it doesn't
                // exist, it is created.
                this._dbFile.file(this._manifestPath, JSON.stringify(this._manifest));
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
                this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._lastRejection);
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
                this._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._lastRejection);
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
                this._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._lastRejection);
            }
        });
    }
    //
    // Protected methods.
    /**
     * This method creates basic assets.
     *
     * @protected
     * @method createBasics
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    createBasics() {
        /** @todo check this method because it's too similar to 'save()' */
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Creating a zip object to manipulate physically store information.
            const zip = new JSZip();
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', () => {
                resolve();
            })
                .on('error', (error) => {
                this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.InvalidDBPath, error));
                reject(this._lastRejection);
            });
        });
    }
    /**
     * This method checks if current connection's zip file exists or not.
     *
     * @protected
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
     * @protected
     * @method internalConnect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
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
                    this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotValid, { error, path: this._dbFullPath }));
                    reject(this._lastRejection);
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
                        this.setFileAccessQueue();
                        //
                        // Loading internal manifest.
                        this.loadManifest()
                            .then(resolve)
                            .catch(reject);
                    }).catch((error) => {
                        this.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotValid, { error, path: this._dbFullPath }));
                        reject(this._lastRejection);
                    });
                }
            });
        });
    }
    /**
     * This method loads the internal manifest file from zip.
     *
     * @protected
     * @method loadManifest
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    loadManifest() {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Retrieving information from file.
            this.loadFile(this._manifestPath)
                .then((results) => {
                //
                // Did we get information?
                if (results.error) {
                    //
                    // If there's no information it creates the file.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
                    //
                    // Parsing information.
                    this._manifest = JSON.parse(results.data);
                    resolve();
                }
            })
                .catch(reject);
        });
    }
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    resetError() {
        this._lastError = null;
        this._lastRejection = null;
    }
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @protected
     * @method setSavingQueue
     */
    setFileAccessQueue() {
        //
        // Creating a new queue.
        // @note It only allow 1 (one) access at a time.
        this._fileAccessQueue = async_1.queue((task, next) => {
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
    /**
     * Updates internal error values and messages.
     *
     * @protected
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    setLastRejection(rejection) {
        this._lastError = `${rejection}`;
        this._lastRejection = rejection;
    }
    //
    // Public class methods.
    /**
     * This method takes the basic values that represent a database and checks if
     * it exists and if it's valid or not.
     *
     * @static
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
                        results.errorCode = rejection_codes_dfdb_1.RejectionCodes.DatabaseDoesntExist;
                        results.error = rejection_codes_dfdb_1.RejectionCodes.Message(results.errorCode);
                        resolve(results);
                    }
                    else {
                        //
                        // Does the header indicates it's a zip file?
                        if (data.toString().substring(0, 2) === 'PK') {
                            results.valid = true;
                        }
                        else {
                            results.errorCode = rejection_codes_dfdb_1.RejectionCodes.DatabaseNotValid;
                            results.error = rejection_codes_dfdb_1.RejectionCodes.Message(results.errorCode);
                        }
                        resolve(results);
                    }
                });
            }
            else {
                results.errorCode = rejection_codes_dfdb_1.RejectionCodes.DatabaseDoesntExist;
                results.error = rejection_codes_dfdb_1.RejectionCodes.Message(results.errorCode);
                resolve(results);
            }
        });
    }
}
exports.Connection = Connection;
