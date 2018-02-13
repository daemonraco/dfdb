/// <reference types="jszip" />
/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';
import { IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
export declare class ConnectionSavingQueueResult {
    error: string;
    data: string;
}
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
    collection(name: string): Promise<Collection>;
    connect(): Promise<boolean>;
    connected(): boolean;
    close(): Promise<void>;
    error(): boolean;
    forgetCollection(name: string): boolean;
    lastError(): string | null;
    loadFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    save(): Promise<void>;
    removeFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    updateFile(zPath: string, data: any, skipPhysicalSave?: boolean): Promise<ConnectionSavingQueueResult>;
    protected createBasics(): Promise<void>;
    protected doesExist(): boolean;
    protected internalConnect(): Promise<boolean>;
    protected resetError(): void;
    protected setSavingQueue(): void;
    static IsValidDatabase(dbName: string, dbPath: string): Promise<any>;
}
