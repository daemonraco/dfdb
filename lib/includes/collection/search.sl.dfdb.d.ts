/**
 * @file search.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { SimpleConditionsList } from '../condition.dfdb';
import { DBDocument } from '../basic-types.dfdb';
import { SubLogicSeeker } from './seeker.sl.dfdb';
/**
 * This class holds Collection's specific logic to find unindexed document field
 * values.
 *
 * @class SubLogicSearch
 */
export declare class SubLogicSearch extends SubLogicSeeker {
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
    count(conditions: SimpleConditionsList): Promise<number>;
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<DBDocument[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions: SimpleConditionsList): Promise<DBDocument[]>;
    /**
     * This is the same than 'searchOne()', but it returns only the first found
     * document.
     *
     * @method searchOne
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<DBDocument>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    searchOne(conditions: SimpleConditionsList): Promise<DBDocument>;
}
