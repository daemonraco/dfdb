/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
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
    addFieldIndex(name: string): Promise<void>;
    connect(): Promise<void>;
    close(): Promise<void>;
    drop(): Promise<void>;
    dropFieldIndex(name: string): Promise<void>;
    error(): boolean;
    find(conditions: any): Promise<any[]>;
    findOne(conditions: any): Promise<any>;
    insert(doc: any): Promise<any>;
    lastError(): string;
    name(): string;
    rebuildFieldIndex(name: string): Promise<void>;
    remove(id: any): Promise<void>;
    search(conditions: any): Promise<any[]>;
    searchOne(conditions: any): Promise<any>;
    truncate(): Promise<void>;
    update(id: any, doc: any): Promise<any>;
    protected addDocToIndex(params: any, next: any): void;
    protected addDocToIndexes(doc: any): Promise<void>;
    protected closeIndex(params: any, next: any): void;
    protected closeIndexes(params: any, next: any): void;
    protected dropIndex(params: any, next: any): void;
    protected dropIndexes(params: any, next: any): void;
    protected dropManifest(params: any, next: any): void;
    protected dropResource(params: any, next: any): void;
    protected dropSequence(params: any, next: any): void;
    protected findIds(conditions: any): Promise<string[]>;
    protected idsToData(ids: string[]): any[];
    protected loadIndex(params: any, next: any): void;
    protected loadIndexes(params: any, next: any): void;
    protected loadManifest(params: any, next: any): void;
    protected loadResource(params: any, next: any): void;
    protected loadSequence(params: any, next: any): void;
    protected processStepsSequence(steps: CollectionStep[], next: any): void;
    protected removeDocFromIndex(params: any, next: any): void;
    protected removeDocFromIndexes(id: string): Promise<void>;
    protected resetError(): void;
    protected truncateIndex(params: any, next: any): void;
    protected truncateIndexes(params: any): Promise<void>;
    protected save(): Promise<void>;
}
