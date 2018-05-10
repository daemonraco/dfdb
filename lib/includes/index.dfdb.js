"use strict";
/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const jsonpath = require("jsonpath-plus");
const rejection_dfdb_1 = require("./rejection.dfdb");
const rejection_codes_dfdb_1 = require("./rejection-codes.dfdb");
const errors_sl_dfdb_1 = require("./errors.sl.dfdb");
/**
 * This class represents a document's field index associated to a collection.
 *
 * @class Index
 */
class Index {
    //
    // Constructor.
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {string} field Name of the field to be index.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection, field, connection) {
        //
        // Protected properties.
        this._collection = null;
        this._connected = false;
        this._connection = null;
        this._data = {};
        this._field = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._subLogicErrors = null;
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this index.
         */
        this.toString = () => {
            return `index:${this._field}`;
        };
        //
        // Shortcuts.
        this._field = field;
        this._collection = collection;
        this._connection = connection;
        //
        // Main path.
        this._resourcePath = `${this._collection.name()}/${this._field}.idx`;
        //
        // Sub-logics.
        this._subLogicErrors = new errors_sl_dfdb_1.SubLogicErrors(this);
    }
    //
    // Public methods.
    /**
     * This method takes a document and adds into this index if it contains the
     * index field.
     *
     * @method addDocument
     * @param {DBDocument} doc Document to be indexed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    addDocument(doc) {
        //
        // This anonymous function takes a value for a index entry and adds the
        // given document ID to it.
        const addValue = (value) => {
            //
            // Value should be indexed in lower case for case-insensitive search.
            value = `${value}`.toLowerCase();
            //
            // Is it a new index value?
            if (typeof this._data[value] === 'undefined') {
                this._data[value] = [doc._id];
            }
            else {
                //
                // Is it already indexed for this value?
                if (this._data[value].indexOf(doc._id) < 0) {
                    this._data[value].push(doc._id);
                    this._data[value].sort();
                }
            }
        };
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Parsing object for the right field.
            const jsonPathValues = jsonpath({ json: doc, path: `\$.${this._field}` });
            //
            // Is it connected and is it the required field present?
            if (this._connected && typeof jsonPathValues[0] !== 'undefined') {
                //
                // If it's an array, each element should be indexes separately.
                if (Array.isArray(jsonPathValues[0])) {
                    //
                    // Indexing each value.
                    jsonPathValues[0].forEach((value) => {
                        if (typeof value !== 'object') {
                            addValue(value);
                        }
                    });
                    //
                    // Saving data on file.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
                else if (typeof jsonPathValues[0] === 'object' && jsonPathValues[0] !== null) {
                    //
                    // At this point, if the value is an object, it cannot be
                    // indexed and should be treated as an error.
                    this._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.NotIndexableValue));
                    reject(this._subLogicErrors.lastRejection());
                }
                else {
                    //
                    // Indexing field's value.
                    addValue(jsonPathValues[0]);
                    //
                    // Saving data on file.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
            }
            else if (!this._connected) {
                this._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.IndexNotConnected));
                reject(this._subLogicErrors.lastRejection());
            }
            else {
                //
                // IF the required field isn't present, the given document is
                // ignored.
                resolve();
            }
        });
    }
    /**
     * Creating an index object doesn't mean it is connected to physical
     * information, this method does that.
     * It connects and loads information from the physical storage in zip file.
     *
     * @method connect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    connect() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (!this._connected) {
                //
                // Setting default data.
                this._data = {};
                //
                // Retrieving data from zip.
                this._connection.loadFile(this._resourcePath)
                    .then((results) => {
                    //
                    // Did it return any data?
                    if (results.error) {
                        //
                        // Setting as connected.
                        this._connected = true;
                        //
                        // Forcing to save.
                        this._connected = true;
                        //
                        // Physically saving data.
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                    else {
                        //
                        // Sanitization.
                        results.data = results.data ? results.data : '';
                        //
                        // Parsing data.
                        results.data.split('\n')
                            .filter(line => line != '')
                            .forEach(line => {
                            const pieces = line.split('|');
                            const key = pieces.shift();
                            this._data[key] = pieces;
                        });
                        //
                        // Setting as connected.
                        this._connected = true;
                        resolve();
                    }
                });
            }
            else {
                //
                // If it's not connected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * This method saves current data and then closes this index.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    close() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Saving data on file.
                this.save()
                    .then(() => {
                    //
                    // Freeing memory
                    this._data = {};
                    //
                    // Disconnecting this index.
                    this._connected = false;
                    resolve();
                })
                    .catch(reject);
            }
            else {
                //
                // If it's not connected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * This method removes this index from its connection and erases all
     * traces of it.
     *
     * @method drop
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    drop() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                this._connection.removeFile(this._resourcePath)
                    .then(() => {
                    // no need to ask collection to forget this index because it's the
                    // collection's responsibillity to invoke this method and then
                    // forget it.
                    this._connected = false;
                    resolve();
                })
                    .catch(reject);
            }
            else {
                //
                // If it's not connected, nothing is done.
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
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.error();
    }
    /**
     * This method searches for document IDs associated to a certain value or
     * piece of value.
     *
     * @method find
     * @param {ConditionsList} conditions List of conditions to check.
     * @returns {Promise<string[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found document IDs.
     */
    find(conditions) {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Selecting only those conditions that apply to this index.
            const conditionsToUse = [];
            conditions.forEach((cond) => {
                if (this._field === cond.field()) {
                    conditionsToUse.push(cond);
                }
            });
            //
            // Initializing a list of findings.
            let findings = [];
            //
            // Checking every index value becuase the one being search may be
            // equal or contained in it.
            Object.keys(this._data).forEach((indexValue) => {
                //
                // Check all conditions against current value.
                let allValid = true;
                conditionsToUse.forEach((cond) => {
                    allValid = allValid && cond.validate(indexValue);
                });
                //
                // Does current condition applies?
                if (allValid) {
                    //
                    // Adding IDs.
                    findings = findings.concat(this._data[indexValue]);
                }
            });
            //
            // Removing duplicates.
            findings = Array.from(new Set(findings));
            //
            // Finishing and returning found IDs.
            resolve(findings);
        });
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError() {
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
    lastRejection() {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastRejection();
    }
    /**
     * This method unindexes a document from this index.
     *
     * @method removeDocument
     * @param {string} id ID of the documento to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeDocument(id) {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Checking each indexed value because it may point to the document
            // to remove.
            Object.keys(this._data).forEach(key => {
                //
                // Does it have it?
                const idx = this._data[key].indexOf(id);
                if (idx > -1) {
                    this._data[key].splice(idx, 1);
                }
                //
                // If current value is empty, it should get forgotten.
                if (this._data[key].length === 0) {
                    delete this._data[key];
                }
            });
            //
            // Saving changes.
            this.save()
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * When the physical file saving is trigger by a later action, this method
     * avoids next file save attempt for this sequence.
     *
     * @method skipSave
     */
    skipSave() {
        this._skipSave = true;
    }
    /**
     * This method removes all data of this index.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    truncate() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Freeing memory.
                this._data = {};
                //
                // Saving changes.
                this.save()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                //
                // If it's not connected, nothing is done.
                resolve();
            }
        });
    }
    //
    // Protected methods.
    /**
     * This method triggers the physical saving of this index file.
     *
     * @protected
     * @method save
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    save() {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            let data = [];
            //
            // Converting data into a list of strings that can be physically
            // stored.
            Object.keys(this._data).forEach(key => {
                data.push(`${key}|${this._data[key].join('|')}`);
            });
            //
            // Saving file.
            this._connection.updateFile(this._resourcePath, data.join('\n'), this._skipSave)
                .then((results) => {
                //
                // Skipped once.
                this._skipSave = false;
                resolve();
            })
                .catch(reject);
        });
    }
}
exports.Index = Index;
