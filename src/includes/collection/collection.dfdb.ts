/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as Ajv from 'ajv';
import * as jsonpath from 'jsonpath-plus';
import * as JSZip from 'jszip';
import * as md5 from 'md5';

import { BasicConstants } from '../constants.dfdb';
import { Connection, ConnectionSavingQueueResult } from '../connection.dfdb';
import { FindSubLogic } from './find.sb.dfb';
import { ICollectionStep } from './collection-step.i.dfdb';
import { Index } from '../index.dfdb';
import { IndexSubLogic } from './index.sb.dfdb';
import { IResource } from '../resource.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SchemaSubLogic } from './schema.sb.dfdb';
import { SearchSubLogic } from './search.sb.dfdb';
import { Sequence } from '../sequence.dfdb';
import { Tools } from '../tools.dfdb';

/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
export class Collection implements IResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _indexes: { [name: string]: Index } = {};
    protected _lastError: string = null;
    protected _lastRejection: Rejection = null;
    protected _manifest: { [name: string]: any } = {
        indexes: {},
        schema: null,
        schemaMD5: null
    };
    protected _manifestPath: string = null;
    protected _name: string = null;
    protected _resourcePath: string = null;
    protected _schemaApplier: any = null;
    protected _schemaValidator: any = null;
    protected _subLogicFind: FindSubLogic = null;
    protected _subLogicIndex: IndexSubLogic = null;
    protected _subLogicSchema: SchemaSubLogic = null;
    protected _subLogicSearch: SearchSubLogic = null;
    protected _sequence: Sequence = null;
    //
    // Constructor.
    /**
     * @constructor
     * @param {string} name Name of the collection to create.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(name: string, connection: Connection) {
        //
        // Shortcuts.
        this._name = name;
        this._connection = connection;
        //
        // Main paths.
        this._manifestPath = `${this._name}/manifest`;
        this._resourcePath = `${this._name}/data.col`;
        //
        // Sub-logics.
        this._subLogicFind = new FindSubLogic(this);
        this._subLogicIndex = new IndexSubLogic(this);
        this._subLogicSchema = new SchemaSubLogic(this);
        this._subLogicSearch = new SearchSubLogic(this);
    }
    //
    // Public methods.
    /**
     * This method associates a new index to a root document field and trigger
     * it's first indexation.
     *
     * @method addFieldIndex
     * @param {name} name Field to index. It also acts as index name.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public addFieldIndex(name: string): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.addFieldIndex(name);
    }
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
    public connect(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it already connected?
            if (!this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps: ICollectionStep[] = [];
                steps.push({ params: {}, stepFunction: (params: any) => this.loadManifest(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this.loadResource(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this.loadSequence(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this._subLogicIndex.loadIndexes(params) });
                //
                // Loading everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                        //
                        // At this point, this collection is considered connected.
                        this._connected = true;
                        //
                        // Loading schema validators if necessary.
                        this._subLogicSchema.loadSchemaHandlers();

                        resolve();
                    })
                    .catch(reject);
            } else {
                //
                // When it's already connected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * This method saves all its data and closes all its associated object, and
     * then informs its connection to fully reload it if it's requested again.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public close(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps: ICollectionStep[] = [];
                //
                // This step closes this collection's sequence.
                steps.push({
                    params: {},
                    stepFunction: (params: any) => {
                        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
                            //
                            // Skipping physical save, that will be dealt with later.
                            this._sequence.skipSave();
                            this._sequence.close()
                                .then(() => {
                                    this._sequence = null;
                                    resolve();
                                })
                                .catch(reject);
                        });
                    }
                });
                steps.push({ params: {}, stepFunction: (params: any) => this._subLogicIndex.closeIndexes(params) });
                //
                // Closing everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                        //
                        // Asking connection to forget this collection and load
                        // from scratch next time it's required.
                        this._connection.forgetCollection(this._name)
                            .then(() => {
                                //
                                // Saving changes.
                                this.save()
                                    .then(() => {
                                        //
                                        // Cleaning data to free memory.
                                        this._data = {};
                                        //
                                        // At this point, this collection is considered
                                        // disconnected.
                                        this._connected = false;
                                        resolve();
                                    })
                                    .catch(reject);
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                //
                // If it's already connected nothing is done.
                resolve();
            }
        });
    }
    /**
     * This method removes this collection from its connection and erases all
     * traces of it. This means all its files and associated object files get
     * remove from the zip file.
     *
     * @method drop
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public drop(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps: ICollectionStep[] = [];
                steps.push({ params: {}, stepFunction: (params: any) => this._subLogicIndex.dropIndexes(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this.dropSequence(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this.dropResource(params) });
                steps.push({ params: {}, stepFunction: (params: any) => this.dropManifest(params) });
                //
                // Dropping everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                        //
                        // Completelly forgetting this collection from its
                        // connection.
                        this._connection.forgetCollection(this._name, true)
                            .then(() => {
                                //
                                // At this point, this collection is considered
                                // disconnected.
                                this._connected = false;
                                resolve();
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                //
                // If it's disconnected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * Removes a field associated index and triggers the removal of its physical
     * data inside the zip file.
     *
     * @method dropFieldIndex
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public dropFieldIndex(name: string): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.dropFieldIndex(name);
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    public error(): boolean {
        return this._lastError !== null;
    }
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    public find(conditions: { [name: string]: any }): Promise<any[]> {
        //
        // Forwarding to sub-logic.
        return this._subLogicFind.find(conditions);
    }
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    public findOne(conditions: any): Promise<any> {
        //
        // Forwarding to sub-logic.
        return this._subLogicFind.findOne(conditions);
    }
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    public hasIndex(name: string): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.hasIndex(name);
    }
    /**
     * Checks if this collection has a schema defined for its documents.
     *
     * @method hasSchema
     * @returns {boolean} Returns TRUE when it has a schema defined.
     */
    public hasSchema(): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicSchema.hasSchema();
    }
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    public indexes(): { [name: string]: any } {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.indexes();
    }
    /**
     * Inserts a new document and updates this collection's indexes with it.
     *
     * @method insert
     * @param {{ [name: string]: any }} doc Document to insert.
     * @returns {Promise<{ [name: string]: any }>} Returns the inserted document
     * completed with all internal fields.
     */
    public insert(doc: { [name: string]: any }): Promise<{ [name: string]: any }> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<{ [name: string]: any }>((resolve: (res: { [name: string]: any }) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //  and is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._lastRejection);
            } else if (!this._connected) {
                this.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._lastRejection);
            } else {
                //
                // Should check the schema?
                if (this.hasSchema()) {
                    //
                    // Is it valid?
                    if (this._schemaValidator(doc)) {
                        //
                        // Fixing default fields.
                        this._schemaApplier(doc);
                    } else {
                        this.setLastRejection(new Rejection(RejectionCodes.SchemaDoesntApply, `'\$${this._schemaValidator.errors[0].dataPath}' ${this._schemaValidator.errors[0].message}`));
                    }
                }
                //
                // Did it fail validating the schema?
                if (!this.error()) {
                    //
                    // Skiping sequence physical update, this will be done
                    // automatically later.
                    this._sequence.skipSave();
                    //
                    // Getting a new and unique id.
                    const newID = this._sequence.next();
                    //
                    // Setting main internal value.
                    const newDate = new Date();
                    doc._id = newID;
                    doc._created = newDate;
                    doc._updated = newDate;
                    //
                    // Inserting document.
                    this._data[newID] = doc;
                    //
                    // Indexing document in all field indexes.
                    this._subLogicIndex.addDocToIndexes(doc)
                        .then(() => {
                            //
                            // Physically saving all changes.
                            this.save()
                                .then(() => {
                                    //
                                    // Finishing and returning document as it was
                                    // inserted.
                                    resolve(this._data[newID]);
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else {
                    reject(this._lastRejection);
                }
            }
        });
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
        return this._lastError;
    }
    /**
     * Provides access to current collection name.
     *
     * @method name
     * @returns {string} Returns a name.
     */
    public name(): string {
        return this._name;
    }
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
    public partialUpdate(id: any, partialDoc: { [name: string]: any }): Promise<any> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<any>((resolve: (res: any) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof partialDoc !== 'object' || Array.isArray(partialDoc)) {
                this.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._lastRejection);
            } else if (typeof this._data[id] === 'undefined') {
                this.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._lastRejection);
            } else if (!this._connected) {
                this.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._lastRejection);
            } else {
                //
                // Merging.
                const mergedDoc = Tools.DeepMergeObjects(this._data[id], partialDoc);
                //
                // Forwarding call.
                this.update(id, mergedDoc)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
    /**
     * This method forces a index to reload and reindex all documents.
     *
     * @method rebuildFieldIndex
     * @param {string} name Name of the field index to rebuild.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public rebuildFieldIndex(name: string): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.rebuildFieldIndex(name);
    }
    /**
     * This method removes a document from this collection based on an ID.
     *
     * @method remove
     * @param {any} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public remove(id: any): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected.
            //      Does the document is present?
            if (!this._connected) {
                this.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._lastRejection);
            } else if (typeof this._data[id] === 'undefined') {
                this.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._lastRejection);
            } else {
                //
                // Removing the document.
                delete this._data[id];
                //
                // Removing the document from all indexes.
                this._subLogicIndex.removeDocFromIndexes(id)
                    .then(() => {
                        //
                        // Physically saving all changes.
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    /**
     * This method removes a the assigned schema for document validaton on this
     * collection.
     *
     * @method removeSchema
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public removeSchema(): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicSchema.removeSchema();
    }
    /**
     * Provides a copy of the assigned schema for document validaton.
     *
     * @method removeSchema
     * @returns {any} Return a deep-copy of current collection's schema.
     */
    public schema(): any {
        //
        // Forwarding to sub-logic.
        return this._subLogicSchema.schema();
    }
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    public search(conditions: { [name: string]: any }): Promise<any[]> {
        //
        // Forwarding to sub-logic.
        return this._subLogicSearch.search(conditions);
    }
    /**
     * This is the same than 'searchOne()', but it returns only the first found
     * document.
     *
     * @method searchOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    public searchOne(conditions: { [name: string]: any }): Promise<any> {
        //
        // Forwarding to sub-logic.
        return this._subLogicSearch.searchOne(conditions);
    }
    /**
     * Assignes or replaces the schema for document validaton on this collection.
     *
     * @method setSchema
     * @param {any} schema Schema to be assigned.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public setSchema(schema: any): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicSchema.setSchema(schema);
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this collection.
     */
    public toString = (): string => {
        return `collection:${this.name()}`;
    }
    /**
     * This method removes all data of this collection and also its indexes.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public truncate(): Promise<void> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Forgetting all data.
                this._data = {};
                //
                // Truncating all indexes.
                this._subLogicIndex.truncateIndexes(null)
                    .then(() => {
                        //
                        // Physically saving all data.
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                //
                // If it's connected, nothing is done.
                resolve();
            }
        });
    }
    /**
     * Updates a document and updates this collection's indexes with it.
     *
     * @method update
     * @param {any} id ID of the document to update.
     * @param {{ [name: string]: any }} doc Document to use as new data.
     * @returns {Promise<{ [name: string]: any }>} Returns the updated document
     * completed with all internal fields.
     */
    public update(id: any, doc: { [name: string]: any }): Promise<any> {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new Promise<any>((resolve: (res: any) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._lastRejection);
            } else if (typeof this._data[id] === 'undefined') {
                this.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._lastRejection);
            } else if (!this._connected) {
                this.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._lastRejection);
            } else {
                //
                // Should check the schema?
                if (this.hasSchema()) {
                    //
                    // Is it valid?
                    if (this._schemaValidator(doc)) {
                        //
                        // Fixing default fields.
                        this._schemaApplier(doc);
                    } else {
                        this.setLastRejection(new Rejection(RejectionCodes.SchemaDoesntApply, `'\$${this._schemaValidator.errors[0].dataPath}' ${this._schemaValidator.errors[0].message}`));
                    }
                }
                //
                // Did it fail validating the schema?
                if (!this.error()) {
                    //
                    // Known document shortcut.
                    const currentDoc = this._data[id];
                    //
                    // Setting main internal value.
                    doc._id = currentDoc._id;
                    doc._created = currentDoc._created;
                    doc._updated = new Date();
                    //
                    // Updating document.
                    this._data[id] = doc;
                    //
                    // Removing document from all field indexes because it may be
                    // outdated.
                    this._subLogicIndex.removeDocFromIndexes(id)
                        .then(() => {
                            //
                            // Reading document to all field indexes.
                            this._subLogicIndex.addDocToIndexes(doc).
                                then(() => {
                                    //
                                    // Physically saving all changes.
                                    this.save()
                                        .then(() => {
                                            //
                                            // Finishing and returning document as it
                                            // was updated.
                                            resolve(this._data[id]);
                                        })
                                        .catch(reject);
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else {
                    reject(this._lastRejection);
                }
            }
        });
    }
    //
    // Protected methods.
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
    protected dropManifest(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Removing manifest from the zip file.
            this._connection.removeFile(this._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    this._manifest = {};
                    resolve();
                })
                .catch(reject);
        });
    }
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
    protected dropResource(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Removing all data from the zip file.
            this._connection.removeFile(this._resourcePath)
                .then((results: ConnectionSavingQueueResult) => {
                    this._data = {};
                    resolve();
                })
                .catch(reject);
        });
    }
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
    protected dropSequence(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Ask sequence to get dropped.
            this._sequence.drop()
                .then(() => {
                    this._sequence = null;
                    resolve();
                })
                .catch(reject);
        });
    }
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
    protected loadManifest(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Retrieving information from file.
            this._connection.loadFile(this._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    //
                    // Did we get information?
                    if (results.error) {
                        //
                        // If there's no information it creates the file.
                        this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
                        //
                        // Parsing information:
                        this._manifest = JSON.parse(results.data);
                        //
                        // Fixing manifest in case it's outdated or broken.
                        this._manifest.schema = typeof this._manifest.schema === 'undefined' ? null : this._manifest.schema;
                        this._manifest.schemaMD5 = typeof this._manifest.schemaMD5 === 'undefined' ? null : this._manifest.schemaMD5;

                        resolve();
                    }
                })
                .catch(reject);
        });
    }
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
    protected loadResource(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Initializing memory cached data as empty.
            this._data = {};
            //
            // Retrieving information from file.
            this._connection.loadFile(this._resourcePath)
                .then((results: ConnectionSavingQueueResult) => {
                    //
                    // Did we get information?
                    if (results.error) {
                        //
                        // If there's no information it creates the file.
                        this._connection.updateFile(this._resourcePath, '')
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
                        //
                        // Parsing information:
                        //  - each line is a document.
                        //  - each line has the format "<ID>|<DOCUMENT>".
                        results.data.split('\n')
                            .filter(line => line != '')
                            .forEach(line => {
                                //
                                // Parsing information from current line.
                                const pieces = line.split('|');
                                const id = pieces.shift();
                                const doc = JSON.parse(pieces.join('|'));
                                //
                                // Fixing ID, just in case.
                                doc._id = id;
                                //
                                // Turning internal dates in actual Date objects.
                                doc._created = new Date(doc._created);
                                doc._updated = new Date(doc._updated);

                                this._data[id] = doc;
                            });
                        resolve();
                    }
                })
                .catch(reject);
        });
    }
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
    protected loadSequence(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Creating a new object to handle the sequence.
            this._sequence = new Sequence(this, BasicConstants.DefaultSequence, this._connection);
            //
            // Connection sequence object with physical information.
            this._sequence.connect()
                .then(resolve)
                .catch(reject);
        });
    }
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
    protected rebuildAllIndexes(params: any): Promise<void> {
        //
        // Forwarding to sub-logic.
        return this._subLogicIndex.rebuildAllIndexes(params);
    }
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    protected resetError(): void {
        this._lastError = null;
        this._lastRejection = null;
    }
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
    protected save(): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            let data: any = [];
            //
            // Converting data into a list of strings that can be physically
            // stored.
            Object.keys(this._data).forEach(id => {
                data.push(`${id}|${JSON.stringify(this._data[id])}`);
            });
            //
            // Asking connection to physically update the infromation of the
            // internal file.
            this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                .then((mResults: ConnectionSavingQueueResult) => {
                    //
                    // Asking connection to physically update the data file.
                    this._connection.updateFile(this._resourcePath, data.join('\n'))
                        .then((rResults: ConnectionSavingQueueResult) => {
                            resolve();
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }
    /**
     * Updates internal error values and messages.
     *
     * @protected
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    protected setLastRejection(rejection: Rejection): void {
        this._lastError = `${rejection}`;
        this._lastRejection = rejection;
    }
    //
    // Public class methods.
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
    public static ProcessStepsSequence(steps: ICollectionStep[]): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Are there steps to process.
            if (steps.length > 0) {
                //
                // Picking a step to process
                const step = steps.shift();
                //
                // Executing the step and setting the recurtion for its callback
                step.stepFunction(step.params)
                    .then(() => Collection.ProcessStepsSequence(steps).then(resolve).catch(reject))
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
}
