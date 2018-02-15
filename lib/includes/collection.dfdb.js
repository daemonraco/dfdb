"use strict";
/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const constants_dfdb_1 = require("./constants.dfdb");
const index_dfdb_1 = require("./index.dfdb");
const sequence_dfdb_1 = require("./sequence.dfdb");
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
        this._lastError = null;
        this._manifest = {
            indexes: {}
        };
        this._manifestPath = null;
        this._name = null;
        this._resourcePath = null;
        this._sequence = null;
        //
        // Short cuts.
        this._name = name;
        this._connection = connection;
        //
        // Main paths.
        this._manifestPath = `${this._name}/manifest`;
        this._resourcePath = `${this._name}/data.col`;
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
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected and is it a new index?
            if (this._connected && typeof this._indexes[name] === 'undefined') {
                //
                // Adding index to the internal manifest.
                this._manifest.indexes[name] = { name, field: name };
                //
                // Reloading all indexes into memory to include the new one.
                this.loadIndexes(null)
                    .then(() => {
                    // Adding all documents.
                    //
                    // List of ids to analyse.
                    let ids = Object.keys(this._data);
                    //
                    // Recursive add-and-wait of all documents to the new
                    // index.
                    const processIds = () => {
                        const id = ids.shift();
                        if (id) {
                            //
                            // Skiping physical save, that will be done when
                            // all documents are added.
                            this._indexes[name].skipSave();
                            this._indexes[name].addDocument(this._data[id])
                                .then(processIds)
                                .catch(reject);
                        }
                        else {
                            //
                            // Saving all changes to this collection and also
                            // saving all changes made on the new index.
                            this.save()
                                .then(resolve)
                                .catch(reject);
                        }
                    };
                    processIds();
                })
                    .catch(reject);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
                this._lastError = `${constants_dfdb_1.Errors.DuplicatedIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
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
        this.resetError();
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
                steps.push({ params: {}, stepFunction: (params) => this.loadIndexes(params) });
                //
                // Loading everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                    //
                    // At this point, this collection is considered connected.
                    this._connected = true;
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
        this.resetError();
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
                steps.push({ params: {}, stepFunction: (params) => this.closeIndexes(params) });
                //
                // Closing everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                    //
                    // Asking connection to forget this collection and load
                    // from scratch next time it's required.
                    this._connection.forgetCollection(this._name);
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
            }
            else {
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
    drop() {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Building a list of loading asynchronous operations to perform.
                let steps = [];
                steps.push({ params: {}, stepFunction: (params) => this.dropIndexes(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropSequence(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropResource(params) });
                steps.push({ params: {}, stepFunction: (params) => this.dropManifest(params) });
                //
                // Dropping everything.
                Collection.ProcessStepsSequence(steps)
                    .then(() => {
                    //
                    // At this point, this collection is considered
                    // disconnected.
                    this._connected = false;
                    resolve();
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
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected and does it have the requested index?
            if (this._connected && typeof this._indexes[name] !== 'undefined') {
                //
                // Ask index to get dropped.
                this._indexes[name].drop()
                    .then(() => {
                    //
                    // Updates the information inside the zip file.
                    this.save()
                        .then(() => {
                        //
                        // Forgets everything about this index.
                        delete this._manifest.indexes[name];
                        delete this._indexes[name];
                        resolve();
                    })
                        .catch(reject);
                })
                    .catch(reject);
            }
            else {
                //
                // If it's not connected or it's not a known index, nothing is
                // done.
                resolve();
            }
        });
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error() {
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
    find(conditions) {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing an empty list of findings.
            const findings = [];
            //
            // Forwarding the search to a method that searches and returns only
            // ids.
            this.findIds(conditions)
                .then((ids) => {
                //
                // Converting the list of IDs into a list of documents.
                ids.forEach(id => findings.push(this._data[id]));
                //
                // Returning found documents.
                resolve(findings);
            })
                .catch(reject);
        });
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
    findOne(conditions) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Forwading search.
            this.find(conditions)
                .then((findings) => {
                //
                // Picking the first document.
                if (findings.length > 0) {
                    resolve(findings[0]);
                }
                else {
                    resolve(null);
                }
            })
                .catch(reject);
        });
    }
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    hasIndex(name) {
        return typeof this._manifest.indexes[name] !== 'undefined';
    }
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    indexes() {
        return JSON.parse(JSON.stringify(this._manifest.indexes));
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
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a valid document?
            //  and is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
                reject(this._lastError);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
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
                this.addDocToIndexes(doc)
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
            }
        });
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError() {
        return this._lastError;
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
     * This method forces a index to reload and reindex all documents.
     *
     * @method rebuildFieldIndex
     * @param {string} name Name of the field index to rebuild.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    rebuildFieldIndex(name) {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected and is it a known field index.
            if (this._connected && typeof this._indexes[name] !== 'undefined') {
                //
                // Dropping index as a way to drop any error.
                this.dropFieldIndex(name)
                    .then(() => {
                    //
                    // Readding index so it starts from scratch.
                    this.addFieldIndex(name)
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
                this._lastError = `${constants_dfdb_1.Errors.UnknownIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
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
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected.
            //      Does the document is present?
            if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else if (typeof this._data[id] === 'undefined') {
                this._lastError = constants_dfdb_1.Errors.DocNotFound;
                reject(this._lastError);
            }
            else {
                //
                // Removing the document.
                delete this._data[id];
                //
                // Removing the document from all indexes.
                this.removeDocFromIndexes(id)
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
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions) {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Default values.
            let findings = [];
            let foundIds = [];
            let indexedConditions = {};
            let unindexedConditions = {};
            //
            // Anonymous function to filter findings based on unindexed fields.
            const unindexedSearch = () => {
                //
                // List of unindexed fields.
                const unindexedConditionsKeys = Object.keys(unindexedConditions);
                //
                // Conditions sanitization. Values should be search un lower case
                // format.
                unindexedConditionsKeys.forEach((key) => unindexedConditions[key] = unindexedConditions[key].toLowerCase());
                //
                // Returning documents that match unindexed conditions.
                resolve(findings.filter((datum) => {
                    let accept = true;
                    //
                    // Checking each conditions.
                    unindexedConditionsKeys.forEach((key) => {
                        //
                        // Does current document have the field being checked. If
                        // not, it's filtered out.
                        if (typeof datum[key] === 'undefined') {
                            accept = false;
                        }
                        else {
                            //
                            // Does it match?
                            if (`${datum[key]}`.toLowerCase().indexOf(unindexedConditions[key]) < 0) {
                                accept = false;
                            }
                        }
                    });
                    return accept;
                }));
            };
            //
            // Separating conditions for indexed fields from unindexed.
            Object.keys(conditions).forEach(key => {
                if (typeof this._indexes[key] === 'undefined') {
                    unindexedConditions[key] = conditions[key];
                }
                else {
                    indexedConditions[key] = conditions[key];
                }
            });
            //
            // Is there indexes conditions that can be used.
            if (Object.keys(indexedConditions).length > 0) {
                //
                // Getting ID of documents that match all conditions of indexed
                // fields.
                this.findIds(indexedConditions)
                    .then((ids) => {
                    //
                    // Converting ids into documents.
                    findings = this.idsToData(ids);
                    //
                    // Filtering based on unindexed conditions.
                    unindexedSearch();
                })
                    .catch(reject);
            }
            else {
                //
                // If there are no indexed conditions, all documents are
                // considered.
                findings = this.idsToData(Object.keys(this._data));
                //
                // Filtering based on unindexed conditions.
                unindexedSearch();
            }
        });
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
    searchOne(conditions) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Forwarding call.
            this.search(conditions)
                .then((findings) => {
                //
                // Picking the first found document.
                if (findings.length > 0) {
                    resolve(findings[0]);
                }
                else {
                    resolve(null);
                }
            })
                .catch(reject);
        });
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
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._connected) {
                //
                // Forgetting all data.
                this._data = {};
                //
                // Truncating all indexes.
                this.truncateIndexes(null)
                    .then(() => {
                    //
                    // Physically saving all data.
                    this.save()
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
            else {
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
    update(id, doc) {
        //
        // Restarting error messages.
        this.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
                reject(this._lastError);
            }
            else if (typeof this._data[id] === 'undefined') {
                this._lastError = constants_dfdb_1.Errors.DocNotFound;
                reject(this._lastError);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
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
                this.removeDocFromIndexes(id)
                    .then(() => {
                    //
                    // Reading document to all field indexes.
                    this.addDocToIndexes(doc).
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
            }
        });
    }
    //
    // Protected methods.
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
    addDocToIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._indexes[params.name].skipSave();
            //
            // Adding document.
            this._indexes[params.name].addDocument(params.doc)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method adds certain document to all field indexes.
     *
     * @protected
     * @method addDocToIndexes
     * @param {{ [name: string]: any }} doc Document to be added.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    addDocToIndexes(doc) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._indexes).forEach(name => {
                steps.push({
                    params: { doc, name },
                    stepFunction: (params) => this.addDocToIndex(params)
                });
            });
            //
            // Indexing.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
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
    closeIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._indexes[params.name].skipSave();
            //
            // Closing index.
            this._indexes[params.name].close()
                .then(() => {
                //
                // Forgetting index object so, in any case, it's reloaded.
                delete this._indexes[params.name];
                resolve();
            })
                .catch(reject);
        });
    }
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
    closeIndexes(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params) => this.closeIndex(params)
                });
            });
            //
            // Closing.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
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
    dropIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Forgetting index.
            delete this._manifest.indexes[params.name];
            //
            // Asking index to get dropped.
            this._indexes[params.name].drop()
                .then(() => {
                //
                // Forgetting index object.
                delete this._indexes[params.name];
                resolve();
            })
                .catch(reject);
        });
    }
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
    dropIndexes(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params) => this.dropIndex(params)
                });
            });
            //
            // Dropping.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
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
     * This method takes a list of conditions and uses them to search ids inside
     * indexes. Once all involved indexes had been checked, it returns those that
     * match in all conditions.
     *
     * @protected
     * @method findIds
     * @param {{ [name: string]: any }} conditions Filtering conditions.
     * @returns {Promise<string[]>} Returns a promise that gets resolve when all
     * operations had finished. In the promise it returns a list of indexes.
     */
    findIds(conditions) {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing a list of indexes to involve.
            const indexesToUse = [];
            //
            // Selecting indexes to use.
            Object.keys(conditions).forEach(key => {
                //
                // Is current field on conditions indexed?
                if (typeof this._indexes[key] === 'undefined') {
                    this._lastError = `${constants_dfdb_1.Errors.NotIndexedField}. Field: '${key}'.`;
                }
                else {
                    indexesToUse.push(key);
                }
            });
            //
            // Was there an error selecting indexes?
            if (!this.error()) {
                //
                // Initializing a list of IDs to return. By default, all documents
                // are considered to match conditions.
                let ids = Object.keys(this._data);
                //
                // Recursive search in all selected indexes.
                const run = () => {
                    //
                    // Picking an index.
                    const idx = indexesToUse.shift();
                    //
                    // is there an index to process?
                    if (idx) {
                        //
                        // Requesting IDs from current index.
                        this._indexes[idx].find(`${conditions[idx]}`)
                            .then((foundIds) => {
                            //
                            // Filtering and leaving only IDs that are present
                            // in the index.
                            ids = ids.filter(i => foundIds.indexOf(i) > -1);
                            //
                            // Recursion.
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        resolve(ids);
                    }
                };
                run();
            }
            else {
                resolve([]);
            }
        });
    }
    /**
     * This method takes a list of IDs and returns a list of documents with those
     * IDs.
     *
     * @protected
     * @method idsToData
     * @param {string[]} ids List of IDs.
     * @returns {{ [name: string]: any}[]} Returns a list of documents.
     */
    idsToData(ids) {
        return ids.map(id => this._data[id]);
    }
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
    loadIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof this._indexes[params.name] === 'undefined') {
                this._indexes[params.name] = new index_dfdb_1.Index(this, params.field, this._connection);
                this._indexes[params.name].connect()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
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
    loadIndexes(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._manifest.indexes).forEach(key => {
                steps.push({
                    params: this._manifest.indexes[key],
                    stepFunction: (params) => this.loadIndex(params)
                });
            });
            //
            // Loading.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
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
     * This method removes a document from a specific index.
     *
     * @protected
     * @method removeDocFromIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('id', 'name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeDocFromIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._indexes[params.name].skipSave();
            //
            // Removing document based on its ID.
            this._indexes[params.name].removeDocument(params.id)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method a document from all field indexes.
     *
     * @protected
     * @method removeDocFromIndexes
     * @param {string} id ID of the document to be removed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeDocFromIndexes(id) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._indexes).forEach(name => {
                steps.push({
                    params: { id, name },
                    stepFunction: (params) => this.removeDocFromIndex(params)
                });
            });
            //
            // Removing document.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method cleans up current error messages.
     *
     * @protected
     * @method resetError
     */
    resetError() {
        this._lastError = null;
    }
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
    truncateIndex(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._indexes[params.name].skipSave();
            this._indexes[params.name].truncate()
                .then(resolve)
                .catch(reject);
        });
    }
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
    truncateIndexes(params) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // List of operations.
            let steps = [];
            //
            // Generating a step for each field index.
            Object.keys(this._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params) => this.truncateIndex(params)
                });
            });
            //
            // Truncating.
            Collection.ProcessStepsSequence(steps)
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
    //
    // Protected class methods.
    /**
     * This method is a generic iterator of recursive asynchronous calls to
     * multiple tasks.
     *
     * @protected
     * @static
     * @method ProcessStepsSequence
     * @param {CollectionStep[]} steps List of steps to take.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    static ProcessStepsSequence(steps) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
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
            }
            else {
                resolve();
            }
        });
    }
}
exports.Collection = Collection;
