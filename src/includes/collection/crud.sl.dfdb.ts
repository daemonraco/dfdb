/**
 * @file crud.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { BasicDictionary, DBDocument, DBDocumentID } from '../basic-types.dfdb';
import { ConditionsList } from '../condition.dfdb';
import { IOpenCollectionCRUD } from './open-collection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools } from '../tools.dfdb';

/**
 * This class holds Collection's logic related to its CRUD operations.
 *
 * @class SubLogicCRUD
 */
export class SubLogicCRUD extends SubLogic<IOpenCollectionCRUD> {
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
    public insert(doc: BasicDictionary): Promise<DBDocument> {
        //
        // Self-copying to avoid issues.
        doc = Tools.DeepCopy(doc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building a promise to return.
        return new Promise<DBDocument>((resolve: (res: DBDocument) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //  and is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else {
                //
                // Should check the schema?
                if (this._mainObject._subLogicSchema.hasSchema()) {
                    //
                    // Is it valid?
                    if (this._mainObject._schemaValidator(doc)) {
                        //
                        // Fixing default fields.
                        this._mainObject._schemaApplier(doc);
                    } else {
                        this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.SchemaDoesntApply, `'\$${this._mainObject._schemaValidator.errors[0].dataPath}' ${this._mainObject._schemaValidator.errors[0].message}`));
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
                                    resolve(Tools.DeepCopyDocument(this._mainObject._data[newID]));
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else {
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
     * @param {DBDocumentID} id ID of the document to update.
     * @param {BasicDictionary} partialDoc Partial document to use as new
     * data.
     * @returns {Promise<BasicDictionary>} Returns the updated document
     * completed with all internal fields.
     */
    public partialUpdate(id: DBDocumentID, partialDoc: BasicDictionary): Promise<DBDocument> {
        //
        // Self-copying to avoid issues.
        partialDoc = Tools.DeepCopy(partialDoc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building a promise to return.
        return new Promise<DBDocument>((resolve: (res: DBDocument) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof partialDoc !== 'object' || Array.isArray(partialDoc)) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else {
                //
                // Cleaning core fields to avoid issues.
                delete partialDoc._id;
                delete partialDoc._created;
                delete partialDoc._updated;
                //
                // Merging.
                const mergedDoc = Tools.DeepMergeObjects(this._mainObject._data[id], partialDoc);
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
     * @param {DBDocumentID} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public remove(id: DBDocumentID): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building a promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected.
            //      Does the document is present?
            if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else {
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
     * This method is similar to 'remove()' but can affect more than one document.
     *
     * @method removeMany
     * @param {ConditionsList} conditions Filtering conditions.
     * @returns {Promise<BasicDictionary>} Returns a simple object describing the
     * operation's results.
     */
    public removeMany(conditions: ConditionsList): Promise<BasicDictionary> {
        //
        // Building a promise to return.
        return new Promise<BasicDictionary>((resolve: (res: BasicDictionary) => void, reject: (err: Rejection) => void) => {
            //
            // Searching for items to remove.
            this._mainObject._subLogicSearch.search(conditions)
                .then((items: DBDocument[]) => {
                    //
                    // Default values.
                    const results: BasicDictionary = {
                        count: 0
                    };
                    //
                    // Extracting only IDs.
                    const ids: DBDocumentID[] = items.map((item: DBDocument) => item._id);
                    //
                    // Creating a function to walk over each ID.
                    const run = () => {
                        //
                        // Picking one ID.
                        const id: DBDocumentID = ids.shift();
                        //
                        // Is there something to update?
                        if (id) {
                            //
                            // Partially updating a document.
                            this.remove(id)
                                .then(() => {
                                    //
                                    // Adding to results.
                                    results.count++;
                                    //
                                    // Going for the next ID.
                                    run();
                                }).catch(reject);
                        } else {
                            //
                            // Finishing and returning results.
                            resolve(results);
                        }
                    };
                    //
                    // Walking over.
                    run();
                })
                .catch(reject)
        });
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
        this._mainObject._subLogicErrors.resetError();
        //
        // Building a promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
     * @param {DBDocumentID} id ID of the document to update.
     * @param {BasicDictionary} doc Document to use as new data.
     * @returns {Promise<BasicDictionary>} Returns the updated document
     * completed with all internal fields.
     */
    public update(id: DBDocumentID, doc: BasicDictionary): Promise<DBDocument> {
        //
        // Self-copying to avoid issues.
        doc = Tools.DeepCopy(doc);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building a promise to return.
        return new Promise<DBDocument>((resolve: (res: DBDocument) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a valid document?
            //      Is it a known document?
            //          Is it connected?
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocIsNotObject));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (typeof this._mainObject._data[id] === 'undefined') {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DocNotFound));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else if (!this._mainObject._connected) {
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            } else {
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
                    } else {
                        this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.SchemaDoesntApply, `'\$${this._mainObject._schemaValidator.errors[0].dataPath}' ${this._mainObject._schemaValidator.errors[0].message}`));
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
                                            resolve(Tools.DeepCopyDocument(this._mainObject._data[id]));
                                        })
                                        .catch(reject);
                                })
                                .catch(reject);
                        })
                        .catch(reject);
                } else {
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
    public updateMany(conditions: ConditionsList, doc: BasicDictionary): Promise<DBDocument[]> {
        //
        // Building a promise to return.
        return new Promise<DBDocument[]>((resolve: (res: DBDocument[]) => void, reject: (err: Rejection) => void) => {
            //
            // Searching for items to update.
            this._mainObject._subLogicSearch.search(conditions)
                .then((items: DBDocument[]) => {
                    //
                    // Default values.
                    const results: DBDocument[] = [];
                    //
                    // Extracting only IDs.
                    const ids: string[] = items.map((item: DBDocument) => item._id);
                    //
                    // Creating a function to walk over each ID.
                    const run = () => {
                        //
                        // Picking one ID.
                        const id: DBDocumentID = ids.shift();
                        //
                        // Is there something to update?
                        if (id) {
                            //
                            // Partially updating a document.
                            this.partialUpdate(id, doc)
                                .then((uDoc: DBDocument) => {
                                    //
                                    // Adding to results.
                                    results.push(uDoc);
                                    //
                                    // Going for the next ID.
                                    run();
                                }).catch(reject);
                        } else {
                            //
                            // Finishing and returning results.
                            resolve(results);
                        }
                    };
                    //
                    // Walking over.
                    run();
                })
                .catch(reject)
        });
    }
}