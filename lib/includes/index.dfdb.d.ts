/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
export declare class Index implements IResource, IDelayedResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _field: string;
    protected _lastError: string;
    protected _resourcePath: string;
    protected _skipSave: boolean;
    protected _collection: Collection;
    constructor(collection: Collection, field: string, connection: Connection);
    addDocument(doc: any): Promise<void>;
    connect(): Promise<void>;
    close(): Promise<void>;
    drop(): Promise<void>;
    error(): boolean;
    find(value: string): Promise<string[]>;
    lastError(): string;
    removeDocument(id: string): Promise<void>;
    skipSave(): void;
    truncate(): Promise<void>;
    protected resetError(): void;
    protected save(): Promise<void>;
}
