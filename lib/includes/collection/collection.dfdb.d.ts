/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from '../connection/connection.dfdb';
import { IErrors } from '../errors.i.dfdb';
import { Index } from '../index.dfdb';
import { IResource } from '../resource.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { SubLogicCRUD } from './crud.sl.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
import { SubLogicFind } from './find.sl.dfdb';
import { SubLogicIndex } from './index.sl.dfdb';
import { SubLogicSchema } from './schema.sl.dfdb';
import { SubLogicSearch } from './search.sl.dfdb';
import { Sequence } from '../sequence.dfdb';
/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
export declare class Collection implements IErrors, IResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _indexes: {
        [name: string]: Index;
    };
    protected _manifest: {
        [name: string]: any;
    };
    protected _manifestPath: string;
    protected _name: string;
    protected _resourcePath: string;
    protected _schemaApplier: any;
    protected _schemaValidator: any;
    protected _subLogicCRUD: SubLogicCRUD;
    protected _subLogicErrors: SubLogicErrors<Collection>;
    protected _subLogicFind: SubLogicFind;
    protected _subLogicIndex: SubLogicIndex;
    protected _subLogicSchema: SubLogicSchema;
    protected _subLogicSearch: SubLogicSearch;
    protected _sequence: Sequence;
    /**
     * @constructor
     * @param {string} name Name of the collection to create.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(name: string, connection: Connection);
    /**
     * This method associates a new index to a root document field and trigger
     * it's first indexation.
     *
     * @method addFieldIndex
     * @param {name} name Field to index. It also acts as index name.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    addFieldIndex(name: string): Promise<void>;
    /**
     * Creating a collection object doesn't mean it is connected to physical
     * information, this method does that.
     * It connects and loads information from the physical storage in zip file,
     * and also loads all its indexes and its manifest.
     *
     * @method connect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    connect(): Promise<void>;
    /**
     * This method saves all its data and closes all its associated object, and
     * then informs its connection to fully reload it if it's requested again.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    close(): Promise<void>;
    /**
     * This method searches for documents that match certain criteria and returns
     * how many documents were found. Conditions may include indexed and unindexed
     * fields.
     *
     * @method count
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<number>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    count(conditions: {
        [name: string]: any;
    }): Promise<number>;
    /**
     * This method removes this collection from its connection and erases all
     * traces of it. This means all its files and associated object files get
     * remove from the zip file.
     *
     * @method drop
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    drop(): Promise<void>;
    /**
     * Removes a field associated index and triggers the removal of its physical
     * data inside the zip file.
     *
     * @method dropFieldIndex
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    dropFieldIndex(name: string): Promise<void>;
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error(): boolean;
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    find(conditions: {
        [name: string]: any;
    }): Promise<any[]>;
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    findOne(conditions: any): Promise<any>;
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    hasIndex(name: string): boolean;
    /**
     * Checks if this collection has a schema defined for its documents.
     *
     * @method hasSchema
     * @returns {boolean} Returns TRUE when it has a schema defined.
     */
    hasSchema(): boolean;
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    indexes(): {
        [name: string]: any;
    };
    /**
     * Inserts a new document and updates this collection's indexes with it.
     *
     * @method insert
     * @param {{ [name: string]: any }} doc Document to insert.
     * @returns {Promise<{ [name: string]: any }>} Returns the inserted document
     * completed with all internal fields.
     */
    insert(doc: {
        [name: string]: any;
    }): Promise<{
        [name: string]: any;
    }>;
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    lastRejection(): Rejection;
    /**
     * Provides access to current collection name.
     *
     * @method name
     * @returns {string} Returns a name.
     */
    name(): string;
    /**
     * This method is similar to 'update()' but it doesn't need to take a complete
     * document. It can take an object with a few fields and deep-merge with the
     * one inside the database.
     *
     * @method update
     * @param {any} id ID of the document to update.
     * @param {{ [name: string]: any }} partialDoc Partial document to use as new
     * data.
     * @returns {Promise<{ [name: string]: any }>} Returns the updated document
     * completed with all internal fields.
     */
    partialUpdate(id: any, partialDoc: {
        [name: string]: any;
    }): Promise<any>;
    /**
     * This method forces a index to reload and reindex all documents.
     *
     * @method rebuildFieldIndex
     * @param {string} name Name of the field index to rebuild.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    rebuildFieldIndex(name: string): Promise<void>;
    /**
     * This method removes a document from this collection based on an ID.
     *
     * @method remove
     * @param {any} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    remove(id: any): Promise<void>;
    /**
     * This method removes a the assigned schema for document validaton on this
     * collection.
     *
     * @method removeSchema
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeSchema(): Promise<void>;
    /**
     * Provides a copy of the assigned schema for document validaton.
     *
     * @method removeSchema
     * @returns {any} Return a deep-copy of current collection's schema.
     */
    schema(): any;
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions: {
        [name: string]: any;
    }): Promise<any[]>;
    /**
     * This is the same than 'searchOne()', but it returns only the first found
     * document.
     *
     * @method searchOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    searchOne(conditions: {
        [name: string]: any;
    }): Promise<any>;
    /**
     * Assignes or replaces the schema for document validaton on this collection.
     *
     * @method setSchema
     * @param {any} schema Schema to be assigned.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    setSchema(schema: any): Promise<void>;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this collection.
     */
    toString: () => string;
    /**
     * This method removes all data of this collection and also its indexes.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    truncate(): Promise<void>;
    /**
     * Updates a document and updates this collection's indexes with it.
     *
     * @method update
     * @param {any} id ID of the document to update.
     * @param {{ [name: string]: any }} doc Document to use as new data.
     * @returns {Promise<{ [name: string]: any }>} Returns the updated document
     * completed with all internal fields.
     */
    update(id: any, doc: {
        [name: string]: any;
    }): Promise<any>;
    /**
     * This method drops the internal manifest file from zip.
     *
     * @protected
     * @method dropManifest
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropManifest(params: any): Promise<void>;
    /**
     * This method drops the data file from zip.
     *
     * @protected
     * @method dropResource
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropResource(params: any): Promise<void>;
    /**
     * This method drops the associated collection sequence.
     *
     * @protected
     * @method dropSequence
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropSequence(params: any): Promise<void>;
    /**
     * This method loads the internal manifest file from zip.
     *
     * @protected
     * @method loadManifest
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadManifest(params: any): Promise<void>;
    /**
     * This method loads the data file from zip.
     *
     * @protected
     * @method loadResource
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadResource(params: any): Promise<void>;
    /**
     * This method loads the associated collection sequence.
     *
     * @protected
     * @method loadSequence
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadSequence(params: any): Promise<void>;
    /**
     * This method triggers the physical saving of all files.
     *
     * @protected
     * @method save
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected save(): Promise<void>;
}
