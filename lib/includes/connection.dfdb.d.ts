/// <reference types="jszip" />
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import { IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
export declare class ConnectionSavingQueueResult {
    error: string;
    data: string;
}
/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
export declare class ConnectionDBValidationResult {
    exists: boolean;
    valid: boolean;
    error: string;
}
/**
 * This class represents an active connection to a database on file.
 *
 * @class Connection
 */
export declare class Connection implements IResource {
    protected _collections: {
        [name: string]: Collection;
    };
    protected _connected: boolean;
    protected _dbFile: JSZip;
    protected _dbFullPath: string;
    protected _dbName: string;
    protected _dbPath: string;
    protected _fileAccessQueue: any;
    protected _lastError: string;
    protected _manifest: {
        [name: string]: any;
    };
    protected _manifestPath: string;
    /**
     * @constructor
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     */
    constructor(dbName: string, dbPath: string, options?: any);
    /**
     * Provides access to a collection inside current database connection. If such
     * collection doesn't exist, it is created.
     *
     * @method collection
     * @param {string} name Collection to look for.
     * @returns {Promise<Collection>} Returns a connection as a promise.
     */
    collection(name: string): Promise<Collection>;
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {{ [name: string]: any }} Returns a list of collections this connection knows.
     */
    collections(): {
        [name: string]: any;
    };
    /**
     * Connects this object to the physicial database file. If the database file
     * doesn't exist it is created.
     *
     * @method connect
     * @returns {Promise<void>} Returns TRUE or FALSE as a promise indicating
     * if it's connected or not.
     */
    connect(): Promise<void>;
    /**
     * Provides access to the connection status.
     *
     * @method connected
     * @returns {boolean} Returns TRUE when it's connected.
     */
    connected(): boolean;
    /**
     * Closes current connection, but first it closes all its collections and also
     * saves all pending changes.
     *
     * @method close
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    close(): Promise<void>;
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error(): boolean;
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
    forgetCollection(name: string, drop?: boolean): Promise<void>;
    /**
     * Provides a way to know if this connection stores certain collection.
     *
     * @method hasCollection
     * @param {string} name Name of the collection to check.
     * @returns {boolean} Returns TRUE when it does.
     */
    hasCollection(name: string): boolean;
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * This method centralizes all calls to load a file from inside the database
     * zip file.
     *
     * @method loadFile
     * @param {string} zPath Internal path to load.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    loadFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    /**
     * Thi method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    save(): Promise<void>;
    /**
     * This method centralizes all calls to remove a file from inside the database
     * zip file.
     *
     * @method removeFile
     * @param {string} zPath Internal path to remove.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    removeFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this connection.
     */
    toString: () => string;
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
    updateFile(zPath: string, data: any, skipPhysicalSave?: boolean): Promise<ConnectionSavingQueueResult>;
    /**
     * This method creates basic assets.
     *
     * @protected
     * @method createBasics
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected createBasics(): Promise<void>;
    /**
     * This method checks if current connection's zip file exists or not.
     *
     * @protected
     * @method doesExist
     * @returns {boolean} Returns TRUE when it does.
     */
    protected doesExist(): boolean;
    /**
     * This method makes the acutal physical connection to this connection's zip
     * file.
     *
     * @protected
     * @method internalConnect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected internalConnect(): Promise<void>;
    /**
     * This method loads the internal manifest file from zip.
     *
     * @protected
     * @method loadManifest
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadManifest(): Promise<void>;
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    protected resetError(): void;
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @protected
     * @method setSavingQueue
     */
    protected setFileAccessQueue(): void;
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
    static IsValidDatabase(dbname: string, dbpath: string): Promise<ConnectionDBValidationResult>;
}
