"use strict";
/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const constants_dfdb_1 = require("../constants.dfdb");
const crud_sl_dfdb_1 = require("./crud.sl.dfdb");
const errors_sl_dfdb_1 = require("../errors.sl.dfdb");
const find_sl_dfdb_1 = require("./find.sl.dfdb");
const index_sl_dfdb_1 = require("./index.sl.dfdb");
const schema_sl_dfdb_1 = require("./schema.sl.dfdb");
const search_sl_dfdb_1 = require("./search.sl.dfdb");
const sequence_dfdb_1 = require("../sequence.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
class Collection {
    //
    // Constructor.
    /**
     * @constructor
     * @param {string} name Name of the collection to create.
     * @param {Connection} connection Collection in which it's stored.
     */
    constructor(name, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._data = {};
        this._indexes = {};
        this._manifest = {
            indexes: {},
            schema: null,
            schemaMD5: null
        };
        this._manifestPath = null;
        this._name = null;
        this._resourcePath = null;
        this._schemaApplier = null;
        this._schemaValidator = null;
        this._subLogicCRUD = null;
        this._subLogicErrors = null;
        this._subLogicFind = null;
        this._subLogicIndex = null;
        this._subLogicSchema = null;
        this._subLogicSearch = null;
        this._sequence = null;
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this collection.
         */
        this.toString = () => {
            return `collection:${this.name()}`;
        };
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
        this._subLogicCRUD = new crud_sl_dfdb_1.SubLogicCRUD(this);
        this._subLogicErrors = new errors_sl_dfdb_1.SubLogicErrors(this);
        this._subLogicFind = new find_sl_dfdb_1.SubLogicFind(this);
        this._subLogicIndex = new index_sl_dfdb_1.SubLogicIndex(this);
        this._subLogicSchema = new schema_sl_dfdb_1.SubLogicSchema(this);
        this._subLogicSearch = new search_sl_dfdb_1.SubLogicSearch(this);
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
    addFieldIndex(name) {
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
    connect() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it already connected?
            if (!this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps = [];
                steps.push({ params: {}, stepFunction: (params) => this.loadManifest(params) });
                steps.push({ params: {}, stepFunction: (params) => this.loadResource(params) });
                steps.push({ params: {}, stepFunction: (params) => this.loadSequence(params) });
                steps.push({ params: {}, stepFunction: (params) => this._subLogicIndex.loadIndexes(params) });
                //
                // Loading everything.
                tools_dfdb_1.Tools.ProcessPromiseSteps(steps)
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
            }
            else {
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
    close() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps = [];
                //
                // This step closes this collection's sequence.
                steps.push({
                    params: {},
                    stepFunction: (params) => {
                        return new es6_promise_1.Promise((resolve, reject) => {
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
                steps.push({ params: {}, stepFunction: (params) => this._subLogicIndex.closeIndexes(params) });
                //
                // Closing everything.
                tools_dfdb_1.Tools.ProcessPromiseSteps(steps)
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
            }
            else {
                //
                // If it's already connected nothing is done.
                resolve();
            }
        });
    }
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
    count(conditions) {
        //
        // Forwarding to sub-logic.
        return this._subLogicSearch.count(conditions);
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
    drop() {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps = [];
                steps.push({ params: {}, stepFunction: (params) => this._subLogicIndex.dropIndexes(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropSequence(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropResource(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropManifest(params) });
                //
                // Dropping everything.
                tools_dfdb_1.Tools.ProcessPromiseSteps(steps)
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
            }
            else {
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
    dropFieldIndex(name) {
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
    error() {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.error();
    }
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    find(conditions) {
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
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    findOne(conditions) {
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
    hasIndex(name) {
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
    hasSchema() {
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
    indexes() {
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
    insert(doc) {
        //
        // Forwarding to sub-logic.
        return this._subLogicCRUD.insert(doc);
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError() {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastError();
    }
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    lastRejection() {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastRejection();
    }
    /**
     * Provides access to current collection name.
     *
     * @method name
     * @returns {string} Returns a name.
     */
    name() {
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
    partialUpdate(id, partialDoc) {
        //
        // Forwarding to sub-logic.
        return this._subLogicCRUD.partialUpdate(id, partialDoc);
    }
    /**
     * This method forces a index to reload and reindex all documents.
     *
     * @method rebuildFieldIndex
     * @param {string} name Name of the field index to rebuild.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    rebuildFieldIndex(name) {
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
    remove(id) {
        //
        // Forwarding to sub-logic.
        return this._subLogicCRUD.remove(id);
    }
    /**
     * This method removes a the assigned schema for document validaton on this
     * collection.
     *
     * @method removeSchema
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeSchema() {
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
    schema() {
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
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions) {
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
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    searchOne(conditions) {
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
    setSchema(schema) {
        //
        // Forwarding to sub-logic.
        return this._subLogicSchema.setSchema(schema);
    }
    /**
     * This method removes all data of this collection and also its indexes.
     *
     * @method truncate
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    truncate() {
        //
        // Forwarding to sub-logic.
        return this._subLogicCRUD.truncate();
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
    update(id, doc) {
        //
        // Forwarding to sub-logic.
        return this._subLogicCRUD.update(id, doc);
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
    dropManifest(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Removing manifest from the zip file.
            this._connection.removeFile(this._manifestPath)
                .then((results) => {
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
    dropResource(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Removing all data from the zip file.
            this._connection.removeFile(this._resourcePath)
                .then((results) => {
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
    dropSequence(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
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
    loadManifest(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Retrieving information from file.
            this._connection.loadFile(this._manifestPath)
                .then((results) => {
                //
                // Did we get information?
                if (results.error) {
                    //
                    // If there's no information it creates the file.
                    this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
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
    loadResource(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing memory cached data as empty.
            this._data = {};
            //
            // Retrieving information from file.
            this._connection.loadFile(this._resourcePath)
                .then((results) => {
                //
                // Did we get information?
                if (results.error) {
                    //
                    // If there's no information it creates the file.
                    this._connection.updateFile(this._resourcePath, '')
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
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
    loadSequence(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Creating a new object to handle the sequence.
            this._sequence = new sequence_dfdb_1.Sequence(this, constants_dfdb_1.BasicConstants.DefaultSequence, this._connection);
            //
            // Connection sequence object with physical information.
            this._sequence.connect()
                .then(resolve)
                .catch(reject);
        });
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
    save() {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            let data = [];
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
                .then((mResults) => {
                //
                // Asking connection to physically update the data file.
                this._connection.updateFile(this._resourcePath, data.join('\n'))
                    .then((rResults) => {
                    resolve();
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
}
exports.Collection = Collection;
