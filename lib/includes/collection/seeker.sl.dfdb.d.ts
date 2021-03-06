/**
 * @file seeker.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { ConditionsList } from '../condition.dfdb';
import { DBDocument } from '../basic-types.dfdb';
import { IOpenCollectionSeeker } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Collection's generic logic related to document search.
 *
 * @class SubLogicSeeker
 */
export declare class SubLogicSeeker extends SubLogic<IOpenCollectionSeeker> {
    /**
     * This method takes a list of conditions and uses them to search ids inside
     * indexes. Once all involved indexes had been checked, it returns those that
     * match in all conditions.
     *
     * @protected
     * @method findIds
     * @param {ConditionsList} conditions Filtering conditions.
     * @returns {Promise<string[]>} Returns a promise that gets resolved when all
     * operations had finished. In the promise it returns a list of indexes.
     */
    protected findIds(conditions: ConditionsList): Promise<string[]>;
    /**
     * This method takes a list of IDs and returns a list of documents with those
     * IDs.
     *
     * @protected
     * @method idsToData
     * @param {string[]} ids List of IDs.
     * @returns {DBDocument[]} Returns a list of documents.
     */
    protected idsToData(ids: string[]): DBDocument[];
}
