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
/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
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
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    hasIndex(name: string): boolean;
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    indexes(): {
        [name: string]: any;
    };
    insert(doc: any): Promise<any>;
    lastError(): string;
    name(): string;
    rebuildFieldIndex(name: string): Promise<void>;
    remove(id: any): Promise<void>;
    search(conditions: any): Promise<any[]>;
    searchOne(conditions: any): Promise<any>;
    truncate(): Promise<void>;
    update(id: any, doc: any): Promise<any>;
    protected addDocToIndex(params: any): Promise<void>;
    protected addDocToIndexes(doc: any): Promise<void>;
    protected closeIndex(params: any): Promise<void>;
    protected closeIndexes(params: any): Promise<void>;
    protected dropIndex(params: any): Promise<void>;
    protected dropIndexes(params: any): Promise<void>;
    protected dropManifest(params: any): Promise<void>;
    protected dropResource(params: any): Promise<void>;
    protected dropSequence(params: any): Promise<void>;
    protected findIds(conditions: any): Promise<string[]>;
    protected idsToData(ids: string[]): any[];
    protected loadIndex(params: any): Promise<void>;
    protected loadIndexes(params: any): Promise<void>;
    protected loadManifest(params: any): Promise<void>;
    protected loadResource(params: any): Promise<void>;
    protected loadSequence(params: any): Promise<void>;
    protected processStepsSequence(steps: CollectionStep[]): Promise<void>;
    protected removeDocFromIndex(params: any): Promise<void>;
    protected removeDocFromIndexes(id: string): Promise<void>;
    protected resetError(): void;
    protected truncateIndex(params: any): Promise<void>;
    protected truncateIndexes(params: any): Promise<void>;
    protected save(): Promise<void>;
}
