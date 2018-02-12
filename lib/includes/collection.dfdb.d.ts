import { IResource } from './interface.resource.dfdb';
import { Connection } from './connection.dfdb';
import { Index } from './index.dfdb';
import { Sequence } from './sequence.dfdb';
export interface CollectionStep {
    params: any;
    function: any;
}
export declare class Collection implements IResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _indexes: {
        [name: string]: Index;
    };
    protected _lastError: string;
    protected _manifest: {
        [name: string]: any;
    };
    protected _manifestPath: string;
    protected _name: string;
    protected _resourcePath: string;
    protected _sequence: Sequence;
    constructor(name: string, connection: Connection);
    addFieldIndex(name: string, done: any): void;
    connect(done: any): void;
    close(done?: any): void;
    drop(done: any): void;
    dropFieldIndex(name: string, done: any): void;
    error(): boolean;
    find(conditions: any, done: any): void;
    findOne(conditions: any, done: any): void;
    insert(doc: any, done: any): void;
    lastError(): string;
    name(): string;
    rebuildFieldIndex(name: string, done: any): void;
    remove(id: any, done: any): void;
    search(conditions: any, done: any): void;
    searchOne(conditions: any, done: any): void;
    truncate(done: any): void;
    update(id: any, doc: any, done: any): void;
    protected addDocToIndex(params: any, next: any): void;
    protected addDocToIndexes(doc: any, next: any): void;
    protected closeIndex(params: any, next: any): void;
    protected closeIndexes(params: any, next: any): void;
    protected dropIndex(params: any, next: any): void;
    protected dropIndexes(params: any, next: any): void;
    protected dropManifest(params: any, next: any): void;
    protected dropResource(params: any, next: any): void;
    protected dropSequence(params: any, next: any): void;
    protected findIds(conditions: any, done: any): void;
    protected idsToData(ids: string[]): any[];
    protected loadIndex(params: any, next: any): void;
    protected loadIndexes(params: any, next: any): void;
    protected loadManifest(params: any, next: any): void;
    protected loadResource(params: any, next: any): void;
    protected loadSequence(params: any, next: any): void;
    protected processStepsSequence(steps: CollectionStep[], next: any): void;
    protected removeDocFromIndex(params: any, next: any): void;
    protected removeDocFromIndexes(id: string, next: any): void;
    protected resetError(): void;
    protected truncateIndex(params: any, next: any): void;
    protected truncateIndexes(params: any, next: any): void;
    protected save(done?: any): void;
}
