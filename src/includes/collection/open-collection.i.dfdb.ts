/**
 * @file open-collection.i.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { Connection } from '../connection.dfdb';
import { Index } from '../index.dfdb';
import { Rejection } from '../rejection.dfdb';
import { Sequence } from '../sequence.dfdb';
import { SubLogicIndex } from './index.sl.dfdb';
import { SubLogicSchema } from './schema.sl.dfdb';

/**
 * @todo DOC
 *
 * @interface IOpenCollectionCRUD
 */
export interface IOpenCollectionCRUD {
    _connected: boolean;
    _data: { [name: string]: any };
    _lastRejection: Rejection;
    _schemaApplier: any;
    _schemaValidator: any;
    _subLogicIndex: SubLogicIndex;
    _subLogicSchema: SubLogicSchema;
    _sequence: Sequence;

    error(): boolean;
    resetError(): void;
    save(): Promise<void>;
    setLastRejection(rejection: Rejection): void;
    update(id: any, doc: { [name: string]: any }): Promise<any>;
}

/**
 * @todo DOC
 *
 * @interface IOpenCollectionIndex
 */
export interface IOpenCollectionIndex {
    _connected: boolean;
    _connection: Connection;
    _data: { [name: string]: any };
    _indexes: { [name: string]: Index };
    _lastRejection: Rejection;
    _manifest: { [name: string]: any };

    resetError(): void;
    save(): Promise<void>;
    setLastRejection(rejection: Rejection): void;
}

/**
 * @todo DOC
 *
 * @interface IOpenCollectionSchema
 */
export interface IOpenCollectionSchema {
    _connected: boolean;
    _data: { [name: string]: any };
    _lastRejection: Rejection;
    _manifest: { [name: string]: any };
    _schemaApplier: any;
    _schemaValidator: any;
    _subLogicIndex: SubLogicIndex;

    error(): boolean;
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
