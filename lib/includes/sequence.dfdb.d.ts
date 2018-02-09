/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Table } from './table.dfdb';
export declare class Sequence implements IResource, IDelayedResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _lastError: string;
    protected _loaded: boolean;
    protected _name: string;
    protected _resourcePath: string;
    protected _skipSave: boolean;
    protected _table: Table;
    protected _value: number;
    constructor(table: Table, name: string, connection: Connection);
    connect(done?: any): void;
    close(done?: any): void;
    error(): boolean;
    lastError(): string;
    next(): number;
    skipSave(): void;
    protected resetError(): void;
    protected save(done?: any): void;
}
