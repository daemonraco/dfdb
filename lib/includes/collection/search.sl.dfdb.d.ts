/**
 * @file search.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { SubLogicSeeker } from './seeker.sl.dfdb';
/**
 * This class holds Collection's specific logic to find unindexed document field
 * values.
 *
 * @class SubLogicSearch
 */
export declare class SubLogicSearch extends SubLogicSeeker {
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions: {
        [name: string]: any;
    }): Promise<any[]>;
    /**
     * This is the same than 'searchOne()', but it returns only the first found
     * document.
     *
     * @method searchOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    searchOne(conditions: {
        [name: string]: any;
    }): Promise<any>;
}