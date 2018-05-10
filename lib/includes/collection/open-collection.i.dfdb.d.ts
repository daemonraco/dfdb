/**
 * @file open-collection.i.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { BasicDictionary, DBDocument } from '../basic-types.dfdb';
import { Collection } from './collection.dfdb';
import { Connection } from '../connection/connection.dfdb';
import { Index } from '../index.dfdb';
import { Sequence } from '../sequence.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
import { SubLogicIndex } from './index.sl.dfdb';
import { SubLogicSchema } from './schema.sl.dfdb';
import { SubLogicSearch } from './search.sl.dfdb';
/**
 * This is a workaround to access public and protected methods and properties of
 * a Collection object.
 *
 * @interface IOpenCollectionCRUD
 */
export interface IOpenCollectionCRUD {
    _connected: boolean;
    _data: BasicDictionary;
    _schemaApplier: any;
    _schemaValidator: any;
    _subLogicErrors: SubLogicErrors<Collection>;
    _subLogicIndex: SubLogicIndex;
    _subLogicSchema: SubLogicSchema;
    _subLogicSearch: SubLogicSearch;
    _sequence: Sequence;
    error(): boolean;
    save(): Promise<void>;
    update(id: any, doc: BasicDictionary): Promise<DBDocument>;
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
    _data: BasicDictionary;
    _indexes: {
        [name: string]: Index;
    };
    _manifest: BasicDictionary;
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
    _data: BasicDictionary;
    _manifest: BasicDictionary;
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
    _data: BasicDictionary;
    _indexes: {
        [name: string]: Index;
    };
    _subLogicErrors: SubLogicErrors<Collection>;
    error(): boolean;
}
