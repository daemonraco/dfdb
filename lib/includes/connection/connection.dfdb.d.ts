/// <reference types="jszip" />
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import { ConnectionDBValidationResult, ConnectionSavingQueueResult } from './types.dfdb';
import { Collection } from '../collection/collection.dfdb';
import { IErrors } from '../errors.i.dfdb';
import { Initializer } from './initializer.dfdb';
import { IResource } from '../resource.i.dfdb';
import { Rejection } from '../rejection.dfdb';
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
export declare class Connection implements IErrors, IResource {
    protected _collections: {
        [name: string]: Collection;
    };
    protected _connected: boolean;
    protected _dbFile: JSZip;
    protected _dbFullPath: string;
    protected _dbName: string;
    protected _dbPath: string;
    protected _fileAccessQueue: any;
    protected _manifest: {
        [name: string]: any;
    };
    protected _manifestPath: string;
    protected _subLogicCollections: SubLogicCollections;
    protected _subLogicConnect: SubLogicConnect;
    protected _subLogicErrors: SubLogicErrors<Connection>;
    protected _subLogicFile: SubLogicFile;
    protected _subLogicInit: SubLogicInit;
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
     * This method allows to know if current database connection has an
     * initializer assigned.
     *
     * @method hasInitiaizer
     * @returns {boolean} Returns TRUE when it has.
     */
    hasInitiaizer(): boolean;
    /**
     * This method allows access to current database connection's  assigned
     * initializer.
     *
     * @method initiaizer
     * @returns {Initializer} Returns a copy of this connection's initializer.
     */
    initiaizer(): Initializer;
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    lastRejection(): Rejection;
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
     * This method tries to reapply the initial database structure an recreates
     * does assets that may be missing.
     *
     * @method reinitialize
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    reinitialize(): Promise<void>;
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
     * This method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    save(): Promise<void>;
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
    setInitializer(specs: Initializer): Promise<void>;
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
    setInitializerFromJSON(specs: any): Promise<void>;
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
    setInitializerFromString(specs: string): Promise<void>;
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
