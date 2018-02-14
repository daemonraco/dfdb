/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
/**
 * This class represents a sequence of ids associated to a collection.
 *
 * @class Sequence
 */
export declare class Sequence implements IResource, IDelayedResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _lastError: string;
    protected _name: string;
    protected _resourcePath: string;
    protected _skipSave: boolean;
    protected _collection: Collection;
    protected _value: number;
    constructor(collection: Collection, name: string, connection: Connection);
    connect(): Promise<void>;
    close(): Promise<void>;
    drop(): Promise<void>;
    error(): boolean;
    lastError(): string;
    next(): number;
    skipSave(): void;
    protected resetError(): void;
    protected save(): Promise<void>;
}
