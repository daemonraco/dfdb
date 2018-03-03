/**
 * @file open-connection.i.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';

import { Collection } from '../collection/collection.dfdb';
import { ConnectionSavingQueueResult } from './types.dfdb';
import { Rejection } from '../rejection.dfdb';
import { SubLogicFile } from './file.sl.dfdb';

/**
 * This is a workaround to access public and protected methods and properties of
 * a Connection object.
 *
 * @interface IOpenConnectionCollections
 */
export interface IOpenConnectionCollections {
    _collections: { [name: string]: Collection };
    _manifest: { [name: string]: any };

    save(): Promise<void>;
    resetError(): void;
}

/**
 * This is a workaround to access public and protected methods and properties of
 * a Connection object.
 *
 * @interface IOpenConnectionFile
 */
export interface IOpenConnectionFile {
    _connected: boolean;
    _dbFile: JSZip;
    _dbFullPath: string;
    _fileAccessQueue: any;
    _lastRejection: Rejection;
    _manifest: { [name: string]: any };
    _manifestPath: string;

    resetError(): void;
    save(): Promise<void>;
    setLastRejection(rejection: Rejection): void;
}

/**
 * This is a workaround to access public and protected methods and properties of
 * a Connection object.
 *
 * @interface IOpenConnectionConnect
 */
export interface IOpenConnectionConnect {
    _collections: { [name: string]: Collection };
    _connected: boolean;
    _dbFile: JSZip;
    _dbFullPath: string;
    _dbName: string;
    _dbPath: string;
    // _fileAccessQueue: any;
    // _lastError: string;
    _lastRejection: Rejection;
    _manifest: { [name: string]: any };
    _manifestPath: string;
    // _subLogicCollections: SubLogicCollections;
    // _subLogicConnect: SubLogicConnect;
    _subLogicFile: SubLogicFile;

    // collection(name: string): Promise<Collection>;
    // collections(): { [name: string]: any };
    // connect(): Promise<void>;
    // connected(): boolean;
    // close(): Promise<void>;
    // error(): boolean;
    // forgetCollection(name: string, drop: boolean = false): Promise<void>;
    // hasCollection(name: string): boolean;
    // lastError(): string | null;
    loadFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    save(): Promise<void>;
    // removeFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    // updateFile(zPath: string, data: any, skipPhysicalSave: boolean = false): Promise<ConnectionSavingQueueResult>;

    // createBasics(): Promise<void>;
    // doesExist(): boolean;
    // internalConnect(): Promise<void>;
    // loadManifest(): Promise<void>;
    resetError(): void;
    // setFileAccessQueue(): void;
    setLastRejection(rejection: Rejection): void;
}



// _collections: { [name: string]: Collection };
// _connected: boolean;
// _dbFile: JSZip;
// _dbFullPath: string;
// _dbName: string;
// _dbPath: string;
// _fileAccessQueue: any;
// _lastError: string;
// _lastRejection: Rejection;
// _manifest: { [name: string]: any };
// _manifestPath: string;
// _subLogicCollections: SubLogicCollections;
// _subLogicConnect: SubLogicConnect;
// _subLogicFile: SubLogicFile;

// collection(name: string): Promise<Collection>;
// collections(): { [name: string]: any };
// connect(): Promise<void>;
// connected(): boolean;
// close(): Promise<void>;
// error(): boolean;
// forgetCollection(name: string, drop: boolean = false): Promise<void>;
// hasCollection(name: string): boolean;
// lastError(): string | null;
// loadFile(zPath: string): Promise<ConnectionSavingQueueResult>;
// save(): Promise<void>;
// removeFile(zPath: string): Promise<ConnectionSavingQueueResult>;
// updateFile(zPath: string, data: any, skipPhysicalSave: boolean = false): Promise<ConnectionSavingQueueResult>;

// createBasics(): Promise<void>;
// doesExist(): boolean;
// internalConnect(): Promise<void>;
// loadManifest(): Promise<void>;
// resetError(): void;
// setFileAccessQueue(): void;
// setLastRejection(rejection: Rejection): void;