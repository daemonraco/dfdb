import { IResource } from './interface.resource.dfdb';
import { Connection } from './connection.dfdb';
import { Index } from './index.dfdb';
import { Sequence } from './sequence.dfdb';
export interface TableStep {
    params: any;
    function: any;
}
export declare class Table implements IResource {
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _indexes: {
        [name: string]: Index;
    };
    protected _lastError: string;
    protected _loaded: boolean;
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
    error(): boolean;
    find(conditions: any, done: any): void;
    findOne(conditions: any, done: any): void;
    insert(doc: any, done: any): void;
    lastError(): string;
    name(): string;
    remove(id: any, done: any): void;
    update(id: any, doc: any, done: any): void;
    protected addDocToIndex(params: any, next: any): void;
    protected addDocToIndexes(doc: any, next: any): void;
    protected loadIndex(params: any, next: any): void;
    protected loadIndexes(params: any, next: any): void;
    protected loadManifest(params: any, next: any): void;
    protected loadResource(params: any, next: any): void;
    protected loadSequence(params: any, next: any): void;
    protected processStepsSequence(steps: TableStep[], next: any): void;
    protected removeDocFromIndex(params: any, next: any): void;
    protected removeDocFromIndexes(id: string, next: any): void;
    protected resetError(): void;
    protected save(done?: any): void;
}
