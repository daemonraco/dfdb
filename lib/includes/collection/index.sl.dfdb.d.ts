/**
 * @file index.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { BasicDictionary, DBDocument, DBDocumentID } from '../basic-types.dfdb';
import { IOpenCollectionIndex } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Collection's logic related to its indexes.
 *
 * @class SubLogicIndex
 */
export declare class SubLogicIndex extends SubLogic<IOpenCollectionIndex> {
    /**
     * This method adds certain document to all field indexes.
     *
     * @method addDocToIndexes
     * @param {DBDocument} doc Document to be added.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    addDocToIndexes(doc: DBDocument): Promise<void>;
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
     * This method closes all field indexes.
     *
     * @method closeIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    closeIndexes(params: any): Promise<void>;
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
     * This method drops all field indexes.
     *
     * @method dropIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    dropIndexes(params: any): Promise<void>;
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    hasIndex(name: string): boolean;
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {BasicDictionary} Retruns a simple object listing indexes.
     */
    indexes(): BasicDictionary;
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
    loadIndexes(params: any): Promise<void>;
    /**
     * This method removes a document from a specific index.
     *
     * @method rebuildAllIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    rebuildAllIndexes(params: any): Promise<void>;
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
     * This method a document from all field indexes.
     *
     * @method removeDocFromIndexes
     * @param {DBDocumentID} id ID of the document to be removed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeDocFromIndexes(id: DBDocumentID): Promise<void>;
    /**
     * This method truncates all field indexes.
     *
     * @method truncateIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    truncateIndexes(params: any): Promise<void>;
    /**
     * This method adds a document to a specific index.
     *
     * @protected
     * @method addDocToIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation ('name', 'doc').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected addDocToIndex(params: BasicDictionary): Promise<void>;
    /**
     * This closes a specific index.
     *
     * @protected
     * @method closeIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected closeIndex(params: BasicDictionary): Promise<void>;
    /**
     * This method drops a specific index.
     *
     * @protected
     * @method dropIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropIndex(params: BasicDictionary): Promise<void>;
    /**
     * This closes a specific index.
     *
     * @protected
     * @method loadIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadIndex(params: BasicDictionary): Promise<void>;
    /**
     * This method removes a document from a specific index.
     *
     * @protected
     * @method removeDocFromIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation ('id', 'name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected removeDocFromIndex(params: BasicDictionary): Promise<void>;
    /**
     * This method truncates a specific index.
     *
     * @protected
     * @method truncateIndex
     * @param {BasicDictionary} params List of required parameters to perform this
     * operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected truncateIndex(params: BasicDictionary): Promise<void>;
}
