/**
 * @file open-collection.i.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Collection } from './collection.dfdb';
import { Connection } from '../connection/connection.dfdb';
import { Index } from '../index.dfdb';
import { Sequence } from '../sequence.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
import { SubLogicIndex } from './index.sl.dfdb';
import { SubLogicSchema } from './schema.sl.dfdb';
/**
 * This is a workaround to access public and protected methods and properties of
 * a Collection object.
 *
 * @interface IOpenCollectionCRUD
 */
export interface IOpenCollectionCRUD {
    _connected: boolean;
    _data: {
        [name: string]: any;
    };
    _schemaApplier: any;
    _schemaValidator: any;
    _subLogicErrors: SubLogicErrors<Collection>;
    _subLogicIndex: SubLogicIndex;
    _subLogicSchema: SubLogicSchema;
    _sequence: Sequence;
    error(): boolean;
    save(): Promise<void>;
    update(id: any, doc: {
        [name: string]: any;
    }): Promise<any>;
}
/**
 * This is a workaround to access public and protected methods and properties of
 * a Collection object.
 *
 * @interface IOpenCollectionIndex
 */
export interface IOpenCollectionIndex {
    _connected: boolean;
    _connection: Connection;
    _data: {
        [name: string]: any;
    };
    _indexes: {
        [name: string]: Index;
    };
    _manifest: {
        [name: string]: any;
    };
    _subLogicErrors: SubLogicErrors<Collection>;
    save(): Promise<void>;
}
/**
 * This is a workaround to access public and protected methods and properties of
 * a Collection object.
 *
 * @interface IOpenCollectionSchema
 */
export interface IOpenCollectionSchema {
    _connected: boolean;
    _data: {
        [name: string]: any;
    };
    _manifest: {
        [name: string]: any;
    };
    _schemaApplier: any;
    _schemaValidator: any;
    _subLogicErrors: SubLogicErrors<Collection>;
    _subLogicIndex: SubLogicIndex;
    error(): boolean;
    save(): Promise<void>;
}
/**
 * This is a workaround to access public and protected methods and properties of
 * a Collection object.
 *
 * @interface IOpenCollectionSeeker
 */
export interface IOpenCollectionSeeker {
    _data: {
        [name: string]: any;
    };
    _indexes: {
        [name: string]: Index;
    };
    _subLogicErrors: SubLogicErrors<Collection>;
    error(): boolean;
}
