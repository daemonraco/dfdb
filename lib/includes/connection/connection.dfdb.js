"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
const es6_promise_1 = require("es6-promise");
const fs = require("fs");
const types_dfdb_1 = require("./types.dfdb");
const manager_dfdb_1 = require("../manager.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const collections_sl_dfdb_1 = require("./collections.sl.dfdb");
const connect_sl_dfdb_1 = require("./connect.sl.dfdb");
const file_sl_dfdb_1 = require("./file.sl.dfdb");
var types_dfdb_2 = require("./types.dfdb");
exports.ConnectionDBValidationResult = types_dfdb_2.ConnectionDBValidationResult;
exports.ConnectionSavingQueueResult = types_dfdb_2.ConnectionSavingQueueResult;
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
        this._subLogicCollections = null;
        this._subLogicConnect = null;
        this._subLogicFile = null;
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
        //
        // Sub-logics.
        this._subLogicCollections = new collections_sl_dfdb_1.SubLogicCollections(this);
        this._subLogicConnect = new connect_sl_dfdb_1.SubLogicConnect(this);
        this._subLogicFile = new file_sl_dfdb_1.SubLogicFile(this);
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
        // Forwarding to sub-logic.
        return this._subLogicCollections.collection(name);
    }
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {{ [name: string]: any }} Returns a list of collections this connection knows.
     */
    collections() {
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
    connect() {
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
    connected() {
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
    close() {
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
    hasCollection(name) {
        //
        // Forwarding to sub-logic.
        return this._subLogicCollections.hasCollection(name);
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
        // Forwarding to sub-logic.
        return this._subLogicFile.loadFile(zPath);
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
        // Forwarding to sub-logic.
        return this._subLogicFile.save();
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
        // Forwarding to sub-logic.
        return this._subLogicFile.removeFile(zPath);
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
        // Forwarding to sub-logic.
        return this._subLogicFile.updateFile(zPath, data, skipPhysicalSave);
    }
    //
    // Protected methods.
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
            const results = new types_dfdb_1.ConnectionDBValidationResult();
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
