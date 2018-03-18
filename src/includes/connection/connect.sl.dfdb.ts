/**
 * @file file.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import * as fs from 'fs';

import { ConnectionSavingQueueResult } from './types.dfdb';
import { DocsOnFileDB } from '../manager.dfdb';
import { IOpenConnectionConnect } from './open-connection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools } from '../tools.dfdb';

declare var process: any;

/**
 * This class holds Connection's specific logic to manpulate how it connects to a
 * database.
 *
 * @class SubLogicConnect
 */
export class SubLogicConnect extends SubLogic<IOpenConnectionConnect> {
    /**
     * Connects this object to the physicial database file. If the database file
     * doesn't exist it is created.
     *
     * @method connect
     * @returns {Promise<void>} Returns TRUE or FALSE as a promise indicating
     * if it's connected or not.
     */
    public connect(): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Does it exist?
            if (this.doesExist()) {
                //
                // Actually connecting.
                this.internalConnect()
                    .then(resolve)
                    .catch(reject);
            } else {
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
    public connected(): boolean {
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
    public close(): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                    } else {
                        //
                        // Saving all changes.
                        this._mainObject.save()
                            .then(() => {
                                //
                                // Setting this connection as not connected.
                                this._mainObject._connected = false;
                                //
                                // Asking manager to forget this connection.
                                DocsOnFileDB.Instance().forgetConnection(this._mainObject._dbName, this._mainObject._dbPath);
                                //
                                // Removing database lock file.
                                try { fs.unlinkSync(this._mainObject._dbLockFullPath); } catch (e) { }

                                resolve();
                            })
                            .catch(reject);
                    }
                }
                run();
            } else {
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
    protected checkLock(lock: boolean = false): boolean {
        let locked: boolean = false;

        if (fs.existsSync(this._mainObject._dbLockFullPath)) {
            const pid: number = parseInt(fs.readFileSync(this._mainObject._dbLockFullPath).toString());
            locked = Tools.IsPidRunning(pid) && pid !== process.pid;
        } else if (lock) {
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
    protected createBasics(): Promise<void> {
        /** @todo check this method because it's too similar to 'save()' */
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Creating a zip object to manipulate physically store information.
            const zip = new JSZip();
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._mainObject._dbFullPath))
                .on('finish', () => {
                    resolve();
                })
                .on('error', (error) => {
                    this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.InvalidDBPath, error));
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
    protected doesExist(): boolean {
        let stat = null;
        try { stat = fs.statSync(this._mainObject._dbFullPath); } catch (e) { }
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
    protected internalConnect(): Promise<void> {
        this._mainObject._connected = false;
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Checking database lock.
            if (this.checkLock(true)) {
                //
                // Physically reading the file.
                fs.readFile(this._mainObject._dbFullPath, (error: any, data: any) => {
                    //
                    // Did it fail?
                    if (error) {
                        //
                        // Rejecting promise.
                        this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DatabaseNotValid, { error, path: this._mainObject._dbFullPath }));
                        reject(this._mainObject._subLogicErrors.lastRejection());
                    } else {
                        //
                        // Parsing data as a zip file.
                        JSZip.loadAsync(data).then((zip: any) => {
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
                        }).catch((error: any) => {
                            this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DatabaseNotValid, { error, path: this._mainObject._dbFullPath }));
                            reject(this._mainObject._subLogicErrors.lastRejection());
                        });
                    }
                });
            } else {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DatabaseLocked));
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
    protected loadManifest(): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Retrieving information from file.
            this._mainObject.loadFile(this._mainObject._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    //
                    // Did we get information?
                    if (results.error) {
                        //
                        // If there's no information it creates the file.
                        this._mainObject.save()
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
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
