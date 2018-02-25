/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Collection } from './collection/collection.dfdb';
import { Condition } from './condition.dfdb';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './resource.i.dfdb';
import { Rejection } from './rejection.dfdb';
/**
 * This class represents a document's field index associated to a collection.
 *
 * @class Index
 */
export declare class Index implements IResource, IDelayedResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _field: string;
    protected _lastError: string;
    protected _lastRejection: Rejection;
    protected _resourcePath: string;
    protected _skipSave: boolean;
    protected _collection: Collection;
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {string} field Name of the field to be index.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection: Collection, field: string, connection: Connection);
    /**
     * This method takes a document and adds into this index if it contains the
     * index field.
     *
     * @method addDocument
     * @param {{ [name:string]: any }} doc Document to be indexed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    addDocument(doc: {
        [name: string]: any;
    }): Promise<void>;
    /**
     * Creating an index object doesn't mean it is connected to physical
     * information, this method does that.
     * It connects and loads information from the physical storage in zip file.
     *
     * @method connect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    connect(): Promise<void>;
    /**
     * This method saves current data and then closes this index.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    close(): Promise<void>;
    /**
     * This method removes this index from its connection and erases all
     * traces of it.
     *
     * @method drop
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    drop(): Promise<void>;
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error(): boolean;
    /**
     * This method searches for document IDs associated to a certain value or
     * piece of value.
     *
     * @method find
     * @param {Condition} cond Value to look for.
     * @returns {Promise<string[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found document IDs.
     */
    find(cond: Condition): Promise<string[]>;
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * This method unindexes a document from this index.
     *
     * @method removeDocument
     * @param {string} id ID of the documento to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeDocument(id: string): Promise<void>;
    /**
     * When the physical file saving is trigger by a later action, this method
     * avoids next file save attempt for this sequence.
     *
     * @method skipSave
     */
    skipSave(): void;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this index.
     */
    toString: () => string;
    /**
     * This method removes all data of this index.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    truncate(): Promise<void>;
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    protected resetError(): void;
    /**
     * This method triggers the physical saving of this index file.
     *
     * @protected
     * @method save
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected save(): Promise<void>;
    /**
     * Updates internal error values and messages.
     *
     * @protected
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    protected setLastRejection(rejection: Rejection): void;
}
