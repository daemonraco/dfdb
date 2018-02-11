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
    addDocument(doc: any, done?: any): void;
    connect(done?: any): void;
    close(done?: any): void;
    drop(done?: any): void;
    error(): boolean;
    find(value: string, done: any): void;
    lastError(): string;
    removeDocument(id: string, done?: any): void;
    skipSave(): void;
    truncate(done: any): void;
    protected resetError(): void;
    protected save(done?: any): void;
}
