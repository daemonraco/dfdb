/**
 * @file crud.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { IOpenCollectionCRUD } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
export declare class SubLogicCRUD extends SubLogic<IOpenCollectionCRUD> {
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
     * This method removes a document from this collection based on an ID.
     *
     * @method remove
     * @param {any} id ID of the document to remove.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    remove(id: any): Promise<void>;
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
}
