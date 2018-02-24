/**
 * @file open-collection.interface.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { Index } from '../index.dfdb';
import { Rejection } from '../rejection.dfdb';

/**
 * @todo DOC
 *
 * @interface IOpenCollectionSchema
 */
export interface IOpenCollectionSchema {
    _connected: boolean;
    // protected _connection: Connection = null;
    _data: { [name: string]: any };
    // protected _indexes: { [name: string]: Index } = {};
    // protected _lastError: string = null;
    _lastRejection: Rejection;
    _manifest: { [name: string]: any };
    // protected _manifestPath: string = null;
    // protected _name: string = null;
    // protected _resourcePath: string = null;
    _schemaApplier: any;
    _schemaValidator: any;
    // protected _sequence: Sequence = null;

    error(): boolean;
    rebuildAllIndexes(params: any): Promise<void>;
    resetError(): void;
    save(): Promise<void>;
    setLastRejection(rejection: Rejection): void;
}

/**
 * @todo DOC
 *
 * @interface IOpenCollectionSeeker
 */
export interface IOpenCollectionSeeker {
    _data: { [name: string]: any };
    _indexes: { [name: string]: Index };

    error(): boolean;
    resetError(): void;
    setLastRejection(rejection: Rejection): void;
}
