/// <reference types="jszip" />
import { IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
import * as JSZip from 'jszip';
export declare class Connection implements IResource {
    protected _collections: {
        [name: string]: Collection;
    };
    protected _connected: boolean;
    protected _dbFile: JSZip;
    protected _dbFullPath: string;
    protected _dbName: string;
    protected _dbPath: string;
    protected _lastError: string;
    protected _savingQueue: any;
    constructor(dbName: string, dbPath: string, options?: any);
    connect(done: any): void;
    connected(): boolean;
    close(done?: any): void;
    error(): boolean;
    forgetCollection(name: string): boolean;
    lastError(): string | null;
    loadFile(zPath: string, done: any): void;
    collection(name: string, done: any): void;
    save(done?: any): void;
    removeFile(zPath: string, done: any): void;
    updateFile(zPath: string, data: any, done: any, skipPhysicalSave?: boolean): void;
    protected createBasics(done: any): void;
    protected doesExist(): boolean;
    protected internalConnect(done: any): void;
    protected resetError(): void;
    protected setSavingQueue(): void;
    static IsValidDatabase(dbName: string, dbPath: string, done: any): void;
}
