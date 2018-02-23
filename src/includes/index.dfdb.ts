/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import * as jsonpath from 'jsonpath-plus';

import { Collection } from './collection.dfdb';
import { Connection, ConnectionSavingQueueResult } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Rejection } from './rejection.dfdb';
import { RejectionCodes } from './rejection-codes.dfdb';

/**
 * This class represents a document's field index associated to a collection.
 *
 * @class Index
 */
export class Index implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _field: string = null;
    protected _lastError: string = null;
    protected _lastRejection: Rejection = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _collection: Collection = null;
    //
    // Constructor.
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {string} field Name of the field to be index.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection: Collection, field: string, connection: Connection) {
        //
        // Shortcuts.
        this._field = field;
        this._collection = collection;
        this._connection = connection;
        //
        // Main path.
        this._resourcePath = `${this._collection.name()}/${this._field}.idx`;
    }
    //
    // Public methods.
    /**
     * This method takes a document and adds into this index if it contains the
     * index field.
     *
     * @method addDocument
     * @param {{ [name:string]: any }} doc Document to be indexed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public addDocument(doc: { [name: string]: any }): Promise<void> {
        //
        // This anonymous function takes a value for a index entry and adds the
        // given document ID to it.
        const addValue = (value: any) => {
            //
            // Value should be indexed in lower case for case-insensitive search.
            value = `${value}`.toLowerCase();
            //
            // Is it a new index value?
            if (typeof this._data[value] === 'undefined') {
                this._data[value] = [doc._id];
            } else {
                //
                // Is it already indexed for this value?
                if (this._data[value].indexOf(doc._id) < 0) {
                    this._data[value].push(doc._id);
                    this._data[value].sort();
                }
            }
        }
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                    jsonPathValues[0].forEach((value: any) => {
                        if (typeof value !== 'object') {
                            addValue(value);
                        }
                    });
                    //
                    // Saving data on file.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                } else if (typeof jsonPathValues[0] === 'object' && jsonPathValues[0] !== null) {
                    //
                    // At this point, if the value is an object, it cannot be
                    // indexed and should be treated as an error.
                    this.setLastRejection(new Rejection(RejectionCodes.NotIndexableValue));
                    reject(this._lastRejection);
                } else {
                    //
                    // Indexing field's value.
                    addValue(jsonPathValues[0]);
                    //
                    // Saving data on file.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
            } else if (!this._connected) {
                this.setLastRejection(new Rejection(RejectionCodes.IndexNotConnected));
                reject(this._lastRejection);
            } else {
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
    public connect(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (!this._connected) {
                //
                // Setting default data.
                this._data = {};
                //
                // Retrieving data from zip.
                this._connection.loadFile(this._resourcePath)
                    .then((results: ConnectionSavingQueueResult) => {
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
                        } else {
                            //
                            // Sanitization.
                            results.data = results.data ? results.data : '';
                            //
                            // Parsing data.
                            results.data.split('\n')
                                .filter(line => line != '')
                                .forEach(line => {
                                    const pieces: string[] = line.split('|');
                                    const key: string = pieces.shift();
                                    this._data[key] = pieces;
                                });
                            //
                            // Setting as connected.
                            this._connected = true;

                            resolve();
                        }
                    });
            } else {
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
    public close(): Promise<void> {
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
            } else {
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
    public drop(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
            } else {
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
    public error(): boolean {
        return this._lastError !== null;
    }
    /**
     * This method searches for document IDs associated to a certain value or
     * piece of value.
     *
     * @method find
     * @param {string} value Value to look for.
     * @returns {Promise<string[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found document IDs.
     */
    public find(value: string): Promise<string[]> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<string[]>((resolve: (res: string[]) => void, reject: (err: Rejection) => void) => {
            //
            // Searches should be done case insensitively
            value = value.toLowerCase();
            //
            // Initializing a list of findings.
            let findings: string[] = [];
            //
            // Checking every index value becuase the one being search may be
            // equal or contained in it.
            Object.keys(this._data).forEach((indexValue: string) => {
                //
                // Does current value contain the one being searched.
                if (indexValue.indexOf(value) > -1) {
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
    public lastError(): string | null {
        return this._lastError;
    }
    /**
     * This method unindexes a document from this index.
     *
     * @method removeDocument
     * @param {string} id ID of the documento to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public removeDocument(id: string): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
    public skipSave(): void {
        this._skipSave = true;
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this index.
     */
    public toString = (): string => {
        return `index:${this._field}`;
    }
    /**
     * This method removes all data of this index.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public truncate(): Promise<void> {
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
                // Freeing memory.
                this._data = {};
                //
                // Saving changes.
                this.save()
                    .then(resolve)
                    .catch(reject);
            } else {
                //
                // If it's not connected, nothing is done.
                resolve();
            }
        });
    }
    //
    // Protected methods.
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
     * This method triggers the physical saving of this index file.
     *
     * @protected
     * @method save
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected save(): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            let data: any = [];
            //
            // Converting data into a list of strings that can be physically
            // stored.
            Object.keys(this._data).forEach(key => {
                data.push(`${key}|${this._data[key].join('|')}`);
            });
            //
            // Saving file.
            this._connection.updateFile(this._resourcePath, data.join('\n'), this._skipSave)
                .then((results: ConnectionSavingQueueResult) => {
                    //
                    // Skipped once.
                    this._skipSave = false;

                    resolve();
                })
                .catch(reject);
        });
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
}
