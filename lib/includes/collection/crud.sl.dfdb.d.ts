/**
 * @file crud.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { BasicDictionary, DBDocument } from '../basic-types.dfdb';
import { ConditionsList } from '../condition.dfdb';
import { IOpenCollectionCRUD } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Collection's logic related to its CRUD operations.
 *
 * @class SubLogicCRUD
 */
export declare class SubLogicCRUD extends SubLogic<IOpenCollectionCRUD> {
    /**
     * Inserts a new document and updates this collection's indexes with it.
     *
     * @method insert
     * @param {BasicDictionary} doc Document to insert.
     * @returns {Promise<DBDocument>} Returns the inserted document completed with
     * all internal fields.
     */
    insert(doc: BasicDictionary): Promise<DBDocument>;
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
    partialUpdate(id: string, partialDoc: BasicDictionary): Promise<DBDocument>;
    /**
     * This method removes a document from this collection based on an ID.
     *
     * @method remove
     * @param {string} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    remove(id: string): Promise<void>;
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
     * @param {string} id ID of the document to update.
     * @param {BasicDictionary} doc Document to use as new data.
     * @returns {Promise<BasicDictionary>} Returns the updated document
     * completed with all internal fields.
     */
    update(id: string, doc: BasicDictionary): Promise<DBDocument>;
    /**
     * This method is similar to 'update()' but can affect more than one document.
     *
     * @method updateMany
     * @param {ConditionsList} conditions Filtering conditions.
     * @param {BasicDictionary} doc Partial document to use as new data.
     * @returns {Promise<DBDocument[]>} Returns a list of updated documents.
     */
    updateMany(conditions: ConditionsList, doc: BasicDictionary): Promise<DBDocument[]>;
}
