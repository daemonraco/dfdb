/**
 * @file seeker.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { IOpenCollectionSeeker } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
export declare class SubLogicSeeker extends SubLogic<IOpenCollectionSeeker> {
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
    protected findIds(conditions: {
        [name: string]: any;
    }): Promise<string[]>;
    /**
     * This method takes a list of IDs and returns a list of documents with those
     * IDs.
     *
     * @protected
     * @method idsToData
     * @param {string[]} ids List of IDs.
     * @returns {{ [name: string]: any}[]} Returns a list of documents.
     */
    protected idsToData(ids: string[]): {
        [name: string]: any;
    }[];
}
