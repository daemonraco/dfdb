"use strict";
/**
 * @file crud.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Collection's logic related to its CRUD operations.
 *
 * @class SubLogicCRUD
 */
class SubLogicCRUD extends sub_logic_dfdb_1.SubLogic {
    //
    // Public methods.
    /**
     * Inserts a new document and updates this collection's indexes with it.
     *
     * @method insert
     * @param {BasicDictionary} doc Document to insert.
     * @returns {Promise<DBDocument>} Returns the inserted document completed with
     * all internal fields.
     */
    insert(doc) {
        //
        // Self-copying to avoid issues.
        doc = tools_dfdb_1.Tools.DeepCopy(doc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a valid document?
            //  and is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else {
                //
                // Should check the schema?
                if (this._mainObject._subLogicSchema.hasSchema()) {
                    //
                    // Is it valid?
                    if (this._mainObject._schemaValidator(doc)) {
                        //
                        // Fixing default fields.
                        this._mainObject._schemaApplier(doc);
                    }
                    else {
                        this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.SchemaDoesntApply, `'\$${this._mainObject._schemaValidator.errors[0].dataPath}' ${this._mainObject._schemaValidator.errors[0].message}`));
                    }
                }
                //
                // Did it fail validating the schema?
                if (!this._mainObject.error()) {
                    //
                    // Skiping sequence physical update, this will be done
                    // automatically later.
                    this._mainObject._sequence.skipSave();
                    //
                    // Getting a new and unique id.
                    const newID = this._mainObject._sequence.next();
                    //
                    // Setting main internal value.
                    const newDate = new Date();
                    doc._id = newID;
                    doc._created = newDate;
                    doc._updated = newDate;
                    //
                    // Inserting document.
                    this._mainObject._data[newID] = doc;
                    //
                    // Indexing document in all field indexes.
                    this._mainObject._subLogicIndex.addDocToIndexes(this._mainObject._data[newID])
                        .then(() => {
                        //
                        // Physically saving all changes.
                        this._mainObject.save()
                            .then(() => {
                            //
                            // Finishing and returning document as it was
                            // inserted.
                            resolve(tools_dfdb_1.Tools.DeepCopyDocument(this._mainObject._data[newID]));
                        })
                            .catch(reject);
                    })
                        .catch(reject);
                }
                else {
                    reject(this._mainObject._subLogicErrors.lastRejection());
                }
            }
        });
    }
    /**
     * This method is similar to 'update()' but it doesn't need to take a complete
     * document. It can take an object with a few fields and deep-merge with the
     * one inside the database.
     *
     * @method partialUpdate
     * @param {string} id ID of the document to update.
     * @param {BasicDictionary} partialDoc Partial document to use as new
     * data.
     * @returns {Promise<BasicDictionary>} Returns the updated document
     * completed with all internal fields.
     */
    partialUpdate(id, partialDoc) {
        //
        // Self-copying to avoid issues.
        partialDoc = tools_dfdb_1.Tools.DeepCopy(partialDoc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof partialDoc !== 'object' || Array.isArray(partialDoc)) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else {
                //
                // Cleaning core fields to avoid issues.
                delete partialDoc._id;
                delete partialDoc._created;
                delete partialDoc._updated;
                //
                // Merging.
                const mergedDoc = tools_dfdb_1.Tools.DeepMergeObjects(this._mainObject._data[id], partialDoc);
                //
                // Forwarding call.
                this._mainObject.update(id, mergedDoc)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
    /**
     * This method removes a document from this collection based on an ID.
     *
     * @method remove
     * @param {string} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    remove(id) {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected.
            //      Does the document is present?
            if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else {
                //
                // Removing the document.
                delete this._mainObject._data[id];
                //
                // Removing the document from all indexes.
                this._mainObject._subLogicIndex.removeDocFromIndexes(id)
                    .then(() => {
                    //
                    // Physically saving all changes.
                    this._mainObject.save()
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
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
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                //
                // Forgetting all data.
                this._mainObject._data = {};
                //
                // Truncating all indexes.
                this._mainObject._subLogicIndex.truncateIndexes(null)
                    .then(() => {
                    //
                    // Physically saving all data.
                    this._mainObject.save()
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
     * @param {string} id ID of the document to update.
     * @param {BasicDictionary} doc Document to use as new data.
     * @returns {Promise<BasicDictionary>} Returns the updated document
     * completed with all internal fields.
     */
    update(id, doc) {
        //
        // Self-copying to avoid issues.
        doc = tools_dfdb_1.Tools.DeepCopy(doc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
            else {
                //
                // Cleaning core fields to avoid issues.
                delete doc._id;
                delete doc._created;
                delete doc._updated;
                //
                // Should check the schema?
                if (this._mainObject._subLogicSchema.hasSchema()) {
                    //
                    // Is it valid?
                    if (this._mainObject._schemaValidator(doc)) {
                        //
                        // Fixing default fields.
                        this._mainObject._schemaApplier(doc);
                    }
                    else {
                        this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.SchemaDoesntApply, `'\$${this._mainObject._schemaValidator.errors[0].dataPath}' ${this._mainObject._schemaValidator.errors[0].message}`));
                    }
                }
                //
                // Did it fail validating the schema?
                if (!this._mainObject.error()) {
                    //
                    // Known document shortcut.
                    const currentDoc = this._mainObject._data[id];
                    //
                    // Setting main internal value.
                    doc._id = currentDoc._id;
                    doc._created = currentDoc._created;
                    doc._updated = new Date();
                    //
                    // Updating document.
                    this._mainObject._data[id] = doc;
                    //
                    // Removing document from all field indexes because it may be
                    // outdated.
                    this._mainObject._subLogicIndex.removeDocFromIndexes(id)
                        .then(() => {
                        //
                        // Reading document to all field indexes.
                        this._mainObject._subLogicIndex.addDocToIndexes(this._mainObject._data[id]).
                            then(() => {
                            //
                            // Physically saving all changes.
                            this._mainObject.save()
                                .then(() => {
                                //
                                // Finishing and returning document as
                                // it was updated.
                                resolve(tools_dfdb_1.Tools.DeepCopyDocument(this._mainObject._data[id]));
                            })
                                .catch(reject);
                        })
                            .catch(reject);
                    })
                        .catch(reject);
                }
                else {
                    reject(this._mainObject._subLogicErrors.lastRejection());
                }
            }
        });
    }
    /**
     * This method is similar to 'update()' but can affect more than one document.
     *
     * @method updateMany
     * @param {ConditionsList} conditions Filtering conditions.
     * @param {BasicDictionary} doc Partial document to use as new data.
     * @returns {Promise<DBDocument[]>} Returns a list of updated documents.
     */
    updateMany(conditions, doc) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Searching for items to update.
            this._mainObject._subLogicSearch.search(conditions)
                .then((items) => {
                //
                // Default values.
                const results = [];
                //
                // Extracting only IDs.
                const ids = items.map((item) => item._id);
                //
                // Creating a function to walk over each ID.
                const run = () => {
                    //
                    // Picking one ID.
                    const id = ids.shift();
                    //
                    // Is there something to update?
                    if (id) {
                        //
                        // Partially updating a document.
                        this.partialUpdate(id, doc)
                            .then((uDoc) => {
                            //
                            // Adding to results.
                            results.push(uDoc);
                            //
                            // Going for the next ID.
                            run();
                        }).catch(reject);
                    }
                    else {
                        //
                        // Finishing and returning results.
                        resolve(results);
                    }
                };
                //
                // Walking over.
                run();
            })
                .catch(reject);
        });
    }
}
exports.SubLogicCRUD = SubLogicCRUD;
