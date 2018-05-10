/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import * as fs from 'fs';

import { BasicConstants } from '../constants.dfdb';
import { BasicDictionary } from '../basic-types.dfdb';
import { ConnectionDBValidationResult, ConnectionSavingQueueResult } from './types.dfdb';
import { DocsOnFileDB } from '../manager.dfdb';
import { Collection } from '../collection/collection.dfdb';
import { IErrors } from '../errors.i.dfdb';
import { Initializer } from './initializer.dfdb';
import { IResource } from '../resource.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogicCollections } from './collections.sl.dfdb';
import { SubLogicConnect } from './connect.sl.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
import { SubLogicFile } from './file.sl.dfdb';
import { SubLogicInit } from './init.sl.dfdb';

export { ConnectionDBValidationResult, ConnectionSavingQueueResult } from './types.dfdb';

/**
 * This class represents an active connection to a database on file.
 *
 * @class Connection
 */
export class Connection implements IErrors, IResource {
    //
    // Protected properties.
    protected _collections: { [name: string]: Collection } = {};
    protected _connected: boolean = false;
    protected _dbFile: JSZip = null;
    protected _dbFullPath: string = null;
    protected _dbLockFullPath: string = null;
    protected _dbName: string = null;
    protected _dbPath: string = null;
    protected _fileAccessQueue: any = null;
    protected _manifest: BasicDictionary = {
        collections: {},
        initializer: null,
        initializerMD5: null
    };
    protected _manifestPath: string = null;
    protected _subLogicCollections: SubLogicCollections = null;
    protected _subLogicConnect: SubLogicConnect = null;
    protected _subLogicErrors: SubLogicErrors<Connection> = null;
    protected _subLogicFile: SubLogicFile = null;
    protected _subLogicInit: SubLogicInit = null;
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
        this._dbLockFullPath = `${this._dbFullPath}${BasicConstants.DBLockExtension}`;
        //
        // Sub-logics.
        this._subLogicCollections = new SubLogicCollections(this);
        this._subLogicConnect = new SubLogicConnect(this);
        this._subLogicErrors = new SubLogicErrors<Connection>(this);
        this._subLogicFile = new SubLogicFile(this);
        this._subLogicInit = new SubLogicInit(this);
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
        // Forwarding to sub-logic.
        return this._subLogicCollections.collection(name);
    }
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {BasicDictionary} Returns a list of collections this connection
     * knows.
     */
    public collections(): BasicDictionary {
        //
        // Forwarding to sub-logic.
        return this._subLogicCollections.collections();
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
        // Forwarding to sub-logic.
        return this._subLogicConnect.connect();
    }
    /**
     * Provides access to the connection status.
     *
     * @method connected
     * @returns {boolean} Returns TRUE when it's connected.
     */
    public connected(): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicConnect.connected();
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
        // Forwarding to sub-logic.
        return this._subLogicConnect.close();
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    public error(): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.error();
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
        // Forwarding to sub-logic.
        return this._subLogicCollections.forgetCollection(name, drop);
    }
    /**
     * Provides a way to know if this connection stores certain collection.
     *
     * @method hasCollection
     * @param {string} name Name of the collection to check.
     * @returns {boolean} Returns TRUE when it does.
     */
    public hasCollection(name: string): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicCollections.hasCollection(name);
    }
    /**
     * This method allows to know if current database connection has an
     * initializer assigned.
     *
     * @method hasInitializer
     * @returns {boolean} Returns TRUE when it has.
     */
    public hasInitializer(): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicInit.hasInitializer();
    }
    /**
     * This method allows access to current database connection's  assigned
     * initializer.
     *
     * @method initializer
     * @returns {Initializer} Returns a copy of this connection's initializer.
     */
    public initializer(): Initializer {
        //
        // Forwarding to sub-logic.
        return this._subLogicInit.initializer();
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastError();
    }
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    public lastRejection(): Rejection {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastRejection();
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
        // Forwarding to sub-logic.
        return this._subLogicFile.loadFile(zPath);
    }
    /**
     * This method tries to reapply the initial database structure an recreates
     * does assets that may be missing.
     *
     * @method reinitialize
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    public reinitialize(): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicInit.reinitialize();
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
        // Forwarding to sub-logic.
        return this._subLogicFile.removeFile(zPath);
    }
    /**
     * This method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    public save(): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicFile.save();
    }
    /**
     * This method assigns an initialization structure to this connection's
     * database and applies it creating all required and missing assets.
     *
     * @method setInitializer
     * @param {Initializer} specs Specifications to associate with this database
     * connection.
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    public setInitializer(specs: Initializer): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicInit.setInitializer(specs);
    }
    /**
     * This method assigns an initialization structure to this connection's
     * database and applies it creating all required and missing assets.
     * Similar to 'setInitializer()' but based on a JSON.
     *
     * @method setInitializerFromJSON
     * @param {any} specs Specifications to associate with this database
     * connection given as a JSON.
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    public setInitializerFromJSON(specs: any): Promise<void> {
        const initializer: Initializer = new Initializer();
        initializer.loadFromJSON(specs);
        return this.setInitializer(initializer);
    }
    /**
     * This method assigns an initialization structure to this connection's
     * database and applies it creating all required and missing assets.
     * Similar to 'setInitializer()' but based on a string.
     *
     * @method setInitializerFromJSON
     * @param {string} specs Specifications to associate with this database
     * connection given as a string.
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    public setInitializerFromString(specs: string): Promise<void> {
        const initializer: Initializer = new Initializer();
        initializer.loadFromString(specs);
        return this.setInitializer(initializer);
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
        // Forwarding to sub-logic.
        return this._subLogicFile.updateFile(zPath, data, skipPhysicalSave);
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