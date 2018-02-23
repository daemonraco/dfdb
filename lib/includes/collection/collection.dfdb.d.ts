/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from '../connection.dfdb';
import { FindSubLogic } from './find.sb.dfb';
import { SearchSubLogic } from './search.sb.dfdb';
import { ICollectionStep } from './collection-step.dfdb';
import { Index } from '../index.dfdb';
import { IResource } from '../interface.resource.dfdb';
import { Rejection } from '../rejection.dfdb';
import { Sequence } from '../sequence.dfdb';
/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
export declare class Collection implements IResource {
    protected _connected: boolean;
    protected _connection: Connection;
    protected _data: {
        [name: string]: any;
    };
    protected _findSubLogic: FindSubLogic;
    protected _indexes: {
        [name: string]: Index;
    };
    protected _lastError: string;
    protected _lastRejection: Rejection;
    protected _manifest: {
        [name: string]: any;
    };
    protected _manifestPath: string;
    protected _name: string;
    protected _resourcePath: string;
    protected _schemaApplier: any;
    protected _schemaValidator: any;
    protected _searchSubLogic: SearchSubLogic;
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
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
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
     * @returns {Promise<any>} Returns a promise that gets resolve when the
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
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
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
     * @returns {Promise<any>} Returns a promise that gets resolve when the
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
     * This method adds a document to a specific index.
     *
     * @protected
     * @method addDocToIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name', 'doc').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected addDocToIndex(params: {
        [name: string]: any;
    }): Promise<void>;
    /**
     * This method adds certain document to all field indexes.
     *
     * @protected
     * @method addDocToIndexes
     * @param {{ [name: string]: any }} doc Document to be added.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected addDocToIndexes(doc: {
        [name: string]: any;
    }): Promise<void>;
    /**
     * This method validates and replaces this collection's schema for document
     * validation.
     *
     * @protected
     * @method applySchema
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('schema', 'schemaMD5').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected applySchema(params: {
        [name: string]: any;
    }): Promise<void>;
    /**
     * This closes a specific index.
     *
     * @protected
     * @method closeIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected closeIndex(params: any): Promise<void>;
    /**
     * This method closes all field indexes.
     *
     * @protected
     * @method closeIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected closeIndexes(params: any): Promise<void>;
    /**
     * This method drops a specific index.
     *
     * @protected
     * @method dropIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropIndex(params: any): Promise<void>;
    /**
     * This method drops all field indexes.
     *
     * @protected
     * @method dropIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropIndexes(params: any): Promise<void>;
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
     * This closes a specific index.
     *
     * @protected
     * @method loadIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadIndex(params: any): Promise<void>;
    /**
     * This method loads all associated field indexes.
     *
     * @protected
     * @method loadIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadIndexes(params: any): Promise<void>;
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
     * This method loads internal schema validation objects.
     *
     * @protected
     * @method loadSchemaHandlers
     */
    protected loadSchemaHandlers(): void;
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
     * This method removes a document from a specific index.
     *
     * @protected
     * @method rebuildAllIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected rebuildAllIndexes(params: any): Promise<void>;
    /**
     * This method removes a document from a specific index.
     *
     * @protected
     * @method removeDocFromIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('id', 'name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected removeDocFromIndex(params: any): Promise<void>;
    /**
     * This method a document from all field indexes.
     *
     * @protected
     * @method removeDocFromIndexes
     * @param {string} id ID of the document to be removed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected removeDocFromIndexes(id: string): Promise<void>;
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    protected resetError(): void;
    /**
     * This method truncates a specific index.
     *
     * @protected
     * @method truncateIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected truncateIndex(params: any): Promise<void>;
    /**
     * This method truncates all field indexes.
     *
     * @protected
     * @method truncateIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected truncateIndexes(params: any): Promise<void>;
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
    /**
     * Updates internal error values and messages.
     *
     * @protected
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    protected setLastRejection(rejection: Rejection): void;
    /**
     * This method is a generic iterator of recursive asynchronous calls to
     * multiple tasks.
     *
     * @protected
     * @static
     * @method ProcessStepsSequence
     * @param {ICollectionStep[]} steps List of steps to take.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected static ProcessStepsSequence(steps: ICollectionStep[]): Promise<void>;
}
