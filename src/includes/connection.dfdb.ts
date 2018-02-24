/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import { queue } from 'async';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

import { BasicConstants, CollectionTypes, ConnectionSaveConstants } from './constants.dfdb';
import { DocsOnFileDB } from './manager.dfdb';
import { Collection } from './collection/collection.dfdb';
import { IResource } from './resource.i.dfdb';
import { Rejection } from './rejection.dfdb';
import { RejectionCodes } from './rejection-codes.dfdb';
import { Tools } from './tools.dfdb';

/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
export class ConnectionSavingQueueResult {
    public error: string = null;
    public data: string = null;
}

/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
export class ConnectionDBValidationResult {
    public exists: boolean = false;
    public valid: boolean = false;
    public error: string = null;
    public errorCode: string = null;
}

/**
 * This class represents an active connection to a database on file.
 *
 * @class Connection
 */
export class Connection implements IResource {
    //
    // Protected properties.
    protected _collections: { [name: string]: Collection } = {};
    protected _connected: boolean = false;
    protected _dbFile: JSZip = null;
    protected _dbFullPath: string = null;
    protected _dbName: string = null;
    protected _dbPath: string = null;
    protected _fileAccessQueue: any = null;
    protected _lastError: string = null;
    protected _lastRejection: Rejection = null;
    protected _manifest: { [name: string]: any } = {
        collections: {}
    };
    protected _manifestPath: string = null;
    //
    // Constructor.
    /**
     * @constructor
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     */
    constructor(dbName: string, dbPath: string, options: any = {}) {
        //
        // Shortcuts.
        this._dbName = dbName;
        this._dbPath = dbPath;
        //
        // Main paths.
        this._manifestPath = `manifest`;
        this._dbFullPath = DocsOnFileDB.GuessDatabasePath(this._dbName, this._dbPath);
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
    public collection(name: string): Promise<Collection> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<Collection>((resolve: (res: Collection) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a known collection?
            if (typeof this._collections[name] !== 'undefined') {
                //
                // Resolving from cache.
                resolve(this._collections[name]);
            } else {
                //
                // Anonymous function to actually handle the collection loading.
                const loadCollection = () => {
                    //
                    // Creating a proper collection object.
                    this._collections[name] = new Collection(name, this);
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
                        type: CollectionTypes.Simple
                    };
                    //
                    // Saving changes before loading.
                    this.save()
                        .then(loadCollection)
                        .catch(reject);
                } else {
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
    public collections(): { [name: string]: any } {
        //
        // Returning a deep-copy to avoid unintentional changes.
        return Tools.DeepCopy(this._manifest.collections);
    }
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
        this.resetError();
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
    public close(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                    } else {
                        //
                        // Saving all changes.
                        this.save()
                            .then(() => {
                                //
                                // Setting this connection as not connected.
                                this._connected = false;
                                //
                                // Asking manager to forget this connection.
                                DocsOnFileDB.Instance().forgetConnection(this._dbName, this._dbPath);
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
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    public error(): boolean {
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
    public forgetCollection(name: string, drop: boolean = false): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                } else {
                    resolve();
                }
            } else {
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
    public hasCollection(name: string): boolean {
        return typeof this._manifest.collections[name] !== 'undefined';
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
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
    public loadFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // is it connected?
            if (this._connected) {
                //
                // Piling up a new zip access operation to read a file.
                this._fileAccessQueue.push({
                    action: ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result: ConnectionSavingQueueResult) => resolve(result));
            } else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
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
    public save(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
            } else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
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
    public removeFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Piling up a new zip access operation to remove a file.
                this._fileAccessQueue.push({
                    action: ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            } else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._lastRejection);
            }
        });
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this connection.
     */
    public toString = (): string => {
        return `connection:${this._dbName}[${this._dbPath}]`;
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
    public updateFile(zPath: string, data: any, skipPhysicalSave: boolean = false): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._connected) {
                this._fileAccessQueue.push({
                    action: ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            } else {
                //
                // It should be connected to actually save.
                this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
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
    protected createBasics(): Promise<void> {
        /** @todo check this method because it's too similar to 'save()' */
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Creating a zip object to manipulate physically store information.
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
     * @protected
     * @method doesExist
     * @returns {boolean} Returns TRUE when it does.
     */
    protected doesExist(): boolean {
        let stat = null;
        try { stat = fs.statSync(this._dbFullPath); } catch (e) { }
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
        this._connected = false;
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Physically reading the file.
            fs.readFile(this._dbFullPath, (error: any, data: any) => {
                //
                // Did it fail?
                if (error) {
                    //
                    // Rejecting promise.
                    this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotValid, { error, path: this._dbFullPath }));
                    reject(this._lastRejection);
                } else {
                    //
                    // Parsing data as a zip file.
                    JSZip.loadAsync(data).then((zip: any) => {
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
                    }).catch((error: any) => {
                        this.setLastRejection(new Rejection(RejectionCodes.DatabaseNotValid, { error, path: this._dbFullPath }));
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
    protected loadManifest(): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Retrieving information from file.
            this.loadFile(this._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    //
                    // Did we get information?
                    if (results.error) {
                        //
                        // If there's no information it creates the file.
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
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
    protected resetError(): void {
        this._lastError = null;
        this._lastRejection = null;
    }
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @protected
     * @method setSavingQueue
     */
    protected setFileAccessQueue(): void {
        //
        // Creating a new queue.
        // @note It only allow 1 (one) access at a time.
        this._fileAccessQueue = queue((task: any, next: (res: ConnectionSavingQueueResult) => void) => {
            //
            // Default values.
            const resutls: ConnectionSavingQueueResult = new ConnectionSavingQueueResult();
            //
            // What action should it attend?
            switch (task.action) {
                case ConnectionSaveConstants.LoadFile:
                    //
                    // Retrieving file from zip.
                    const file = this._dbFile.file(task.path);
                    //
                    // Does it exist?
                    if (file !== null) {
                        //
                        // Parsing and returning its connents.
                        file.async('text').then((data: string) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    } else {
                        //
                        // Setting an error message and responding.
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case ConnectionSaveConstants.RemoveFile:
                    //
                    // Removing a file from zip.
                    this._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case ConnectionSaveConstants.UpdateFile:
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
                            .catch((err: string) => next(resutls));
                    } else {
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
    protected setLastRejection(rejection: Rejection): void {
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
    public static IsValidDatabase(dbname: string, dbpath: string): Promise<ConnectionDBValidationResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionDBValidationResult>((resolve: (res: ConnectionDBValidationResult) => void, reject: (err: Rejection) => void) => {
            //
            // Default values.
            const results: ConnectionDBValidationResult = new ConnectionDBValidationResult();
            //
            // Guessing database zip file's full path.
            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
            //
            // Checking its existence.
            let stat: any = null;
            try { stat = fs.statSync(dbFullPath); } catch (e) { }
            //
            // Does it exist?
            if (stat) {
                results.exists = true;
                //
                // Loading its information for further analysis.
                fs.readFile(dbFullPath, (error: any, data: any) => {
                    //
                    // Was it read?
                    if (error) {
                        results.errorCode = RejectionCodes.DatabaseDoesntExist;
                        results.error = RejectionCodes.Message(results.errorCode);
                        resolve(results);
                    } else {
                        //
                        // Does the header indicates it's a zip file?
                        if (data.toString().substring(0, 2) === 'PK') {
                            results.valid = true;
                        } else {
                            results.errorCode = RejectionCodes.DatabaseNotValid;
                            results.error = RejectionCodes.Message(results.errorCode);
                        }
                        resolve(results);
                    }
                });
            } else {
                results.errorCode = RejectionCodes.DatabaseDoesntExist;
                results.error = RejectionCodes.Message(results.errorCode);
                resolve(results);
            }
        });
    }
}