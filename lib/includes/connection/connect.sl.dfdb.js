"use strict";
/**
 * @file file.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const JSZip = require("jszip");
const fs = require("fs");
const manager_dfdb_1 = require("../manager.dfdb");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Connection's specific logic to manpulate how it connects to a
 * database.
 *
 * @class SubLogicConnect
 */
class SubLogicConnect extends sub_logic_dfdb_1.SubLogic {
    //
    // Public methods.
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
        this._mainObject._subLogicErrors.resetError();
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
        return this._mainObject._connected;
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
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is is connected?
            if (this._mainObject._connected) {
                //
                // List of names of all cached collections.
                const collectionNames = Object.keys(this._mainObject._collections);
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
                        this._mainObject._collections[collectionName].close()
                            .then(() => {
                            //
                            // Forgetting collection.
                            delete this._mainObject._collections[collectionName];
                            //
                            // Running the next step.
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        //
                        // Saving all changes.
                        this._mainObject.save()
                            .then(() => {
                            //
                            // Setting this connection as not connected.
                            this._mainObject._connected = false;
                            //
                            // Asking manager to forget this connection.
                            manager_dfdb_1.DocsOnFileDB.Instance().forgetConnection(this._mainObject._dbName, this._mainObject._dbPath);
                            //
                            // Removing database lock file.
                            try {
                                fs.unlinkSync(this._mainObject._dbLockFullPath);
                            }
                            catch (e) { }
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
    //
    // Protected methods.
    /**
     * This method check this database is locked and who is locking it.
     *
     * @param {boolean} lock When TRUE, if the database is not locked, it locks
     * it.
     * @returns {boolean} Returns TRUE when this database is not locked for this
     * process.
     */
    checkLock(lock = false) {
        let locked = false;
        if (fs.existsSync(this._mainObject._dbLockFullPath)) {
            const pid = parseInt(fs.readFileSync(this._mainObject._dbLockFullPath).toString());
            locked = tools_dfdb_1.Tools.IsPidRunning(pid) && pid !== process.pid;
        }
        else if (lock) {
            fs.writeFileSync(this._mainObject._dbLockFullPath, process.pid);
        }
        return !locked;
    }
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
                .pipe(fs.createWriteStream(this._mainObject._dbFullPath))
                .on('finish', () => {
                resolve();
            })
                .on('error', (error) => {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.InvalidDBPath, error));
                reject(this._mainObject._subLogicErrors.lastRejection());
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
            stat = fs.statSync(this._mainObject._dbFullPath);
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
        this._mainObject._connected = false;
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Checking database lock.
            if (this.checkLock(true)) {
                //
                // Physically reading the file.
                fs.readFile(this._mainObject._dbFullPath, (error, data) => {
                    //
                    // Did it fail?
                    if (error) {
                        //
                        // Rejecting promise.
                        this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotValid, { error, path: this._mainObject._dbFullPath }));
                        reject(this._mainObject._subLogicErrors.lastRejection());
                    }
                    else {
                        //
                        // Parsing data as a zip file.
                        JSZip.loadAsync(data).then((zip) => {
                            //
                            // Zip file shortcut.
                            this._mainObject._dbFile = zip;
                            this._mainObject._connected = true;
                            //
                            // Starting the queue that centralizes all file
                            // accesses.
                            this._mainObject._subLogicFile.setFileAccessQueue();
                            //
                            // Loading internal manifest.
                            this.loadManifest()
                                .then(resolve)
                                .catch(reject);
                        }).catch((error) => {
                            this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotValid, { error, path: this._mainObject._dbFullPath }));
                            reject(this._mainObject._subLogicErrors.lastRejection());
                        });
                    }
                });
            }
            else {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseLocked));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
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
            this._mainObject.loadFile(this._mainObject._manifestPath)
                .then((results) => {
                //
                // Did we get information?
                if (results.error) {
                    //
                    // If there's no information it creates the file.
                    this._mainObject.save()
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
                    //
                    // Parsing information.
                    this._mainObject._manifest = JSON.parse(results.data);
                    resolve();
                }
            })
                .catch(reject);
        });
    }
}
exports.SubLogicConnect = SubLogicConnect;
