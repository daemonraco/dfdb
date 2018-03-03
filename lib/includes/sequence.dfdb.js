"use strict";
/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const errors_sl_dfdb_1 = require("./errors.sl.dfdb");
/**
 * This class represents a sequence of ids associated to a collection.
 *
 * @class Sequence
 */
class Sequence {
    //
    // Constructor.
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection, name, connection) {
        //
        // Protected properties.
        this._collection = null;
        this._connected = false;
        this._connection = null;
        this._name = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._subLogicErrors = null;
        this._value = 0;
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this sequence.
         */
        this.toString = () => {
            return `sequence:${this._name}`;
        };
        //
        // Shortcuts.
        this._name = name;
        this._collection = collection;
        this._connection = connection;
        //
        // Main path.
        this._resourcePath = `${this._collection.name()}/${this._name}.seq`;
        //
        // Sub-logics.
        this._subLogicErrors = new errors_sl_dfdb_1.SubLogicErrors(this);
    }
    //
    // Public methods.
    /**
     * Creating a sequence object doesn't mean it is connected to physical
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
                // Retrieving data from zip file.
                this._connection.loadFile(this._resourcePath)
                    .then((results) => {
                    //
                    // Did it fail?
                    if (results.error) {
                        //
                        // Setting as connected.
                        this._connected = true;
                        //
                        // Starting from scratch.
                        this._value = 0;
                        //
                        // Forcing to save... skipping the skip save :)
                        this._skipSave = false;
                        //
                        // Physically saving data.
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                    else if (results.data !== null) {
                        //
                        // Parsing data.
                        this._value = parseInt(results.data);
                        //
                        // At this point, this secuence is considered to be
                        // connected.
                        this._connected = true;
                        resolve();
                    }
                })
                    .catch(reject);
            }
            else {
                //
                // If it's already connected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * This method saves current value and then closes this sequence.
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
                // Saving value.
                this.save()
                    .then(() => {
                    //
                    // Resetting current value.
                    this._value = 0;
                    //
                    // Disconnecting this sequence to avoid issues.
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
     * This method removes this sequence from its connection and erases all
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
                //
                // Removing file from zip.
                this._connection.removeFile(this._resourcePath)
                    .then((results) => {
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
     * This method advances the internal counter and returns it for ID usage
     * guaranteeing that it's unique.
     *
     * @method next
     * @returns {string} Returns a unique ID.
     */
    next() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Incrementing internal counter.
        this._value++;
        //
        // Committing new value to file.
        this.save()
            .then(() => { })
            .catch(() => { });
        //
        // Returning the ID and enforsing that it's a string.
        return `${this._value}`;
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
    //
    // Protected methods.
    /**
     * This method triggers the physical saving of this sequence file.
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
            //
            // Saving file.
            this._connection.updateFile(this._resourcePath, `${this._value}`, this._skipSave)
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
exports.Sequence = Sequence;
