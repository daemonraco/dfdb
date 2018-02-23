/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Collection } from './collection/collection.dfdb';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Rejection } from './rejection.dfdb';
/**
 * This class represents a sequence of ids associated to a collection.
 *
 * @class Sequence
 */
export declare class Sequence implements IResource, IDelayedResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _lastError: string;
    protected _lastRejection: Rejection;
    protected _name: string;
    protected _resourcePath: string;
    protected _skipSave: boolean;
    protected _collection: Collection;
    protected _value: number;
    /**
     * @constructor
     * @param {Collection} collection Collection to which this index is
     * associated.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(collection: Collection, name: string, connection: Connection);
    /**
     * Creating a sequence object doesn't mean it is connected to physical
     * information, this method does that.
     * It connects and loads information from the physical storage in zip file.
     *
     * @method connect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    connect(): Promise<void>;
    /**
     * This method saves current value and then closes this sequence.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    close(): Promise<void>;
    /**
     * This method removes this sequence from its connection and erases all
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
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * This method advances the internal counter and returns it for ID usage
     * guaranteeing that it's unique.
     *
     * @method next
     * @returns {string} Returns a unique ID.
     */
    next(): string;
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
     * @returns {string} Returns a simple string identifying this sequence.
     */
    toString: () => string;
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    protected resetError(): void;
    /**
     * This method triggers the physical saving of this sequence file.
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
