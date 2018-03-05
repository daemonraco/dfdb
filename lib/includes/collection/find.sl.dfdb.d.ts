/**
 * @file find.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { SimpleConditionsList } from '../condition.dfdb';
import { SubLogicSeeker } from './seeker.sl.dfdb';
/**
 * This class holds Collection's specific logic to find indexed document field
 * values.
 *
 * @class SubLogicFind
 */
export declare class SubLogicFind extends SubLogicSeeker {
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    find(conditions: SimpleConditionsList): Promise<any[]>;
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    findOne(conditions: SimpleConditionsList): Promise<any>;
}
