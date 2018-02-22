/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';

import { Collection } from './collection.dfdb';
import { Connection, ConnectionSavingQueueResult } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Rejection } from './rejection.dfdb';
import { RejectionCodes } from './rejection-codes.dfdb';

/**
 * This class represents a sequence of ids associated to a collection.
 *
 * @class Sequence
 */
export class Sequence implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _lastError: string = null;
    protected _lastRejection: Rejection = null;
    protected _name: string = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _collection: Collection = null;
    protected _value: number = 0;
    //
    // Constructor.
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection: Collection, name: string, connection: Connection) {
        //
        // Shortcuts.
        this._name = name;
        this._collection = collection;
        this._connection = connection;
        //
        // Main path.
        this._resourcePath = `${this._collection.name()}/${this._name}.seq`;
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
                // Retrieving data from zip file.
                this._connection.loadFile(this._resourcePath)
                    .then((results: ConnectionSavingQueueResult) => {
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
                        } else if (results.data !== null) {
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
            } else {
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
            } else {
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
                //
                // Removing file from zip.
                this._connection.removeFile(this._resourcePath)
                    .then((results: ConnectionSavingQueueResult) => {
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
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
        return this._lastError;
    }
    /**
     * This method advances the internal counter and returns it for ID usage
     * guaranteeing that it's unique.
     *
     * @method next
     * @returns {string} Returns a unique ID.
     */
    public next(): string {
        //
        // Restarting error messages.
        this.resetError();
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
    public skipSave(): void {
        this._skipSave = true;
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this sequence.
     */
    public toString = (): string => {
        return `sequence:${this._name}`;
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
     * This method triggers the physical saving of this sequence file.
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
            //
            // Saving file.
            this._connection.updateFile(this._resourcePath, `${this._value}`, this._skipSave)
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
