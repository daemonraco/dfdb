/// <reference types="jszip" />
import { IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
import * as JSZip from 'jszip';
export declare class Connection implements IResource {
    protected _connected: boolean;
    protected _dbFile: JSZip;
    protected _dbFullPath: string;
    protected _dbName: string;
    protected _dbPath: string;
    protected _lastError: string;
    protected _collections: {
        [name: string]: Collection;
    };
    constructor(dbName: string, dbPath: string, options?: any);
    connect(done: any): void;
    connected(): boolean;
    close(done?: any): void;
    error(): boolean;
    filePointer(): JSZip;
    forgetCollection(name: string): boolean;
    lastError(): string | null;
    collection(name: string, done: any): void;
    save(done?: any): void;
    protected createBasics(done: any): void;
    protected doesExist(): boolean;
    protected internalConnect(done: any): void;
    protected resetError(): void;
}
