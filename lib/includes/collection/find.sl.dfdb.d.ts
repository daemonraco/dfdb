/**
 * @file find.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
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
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    find(conditions: {
        [name: string]: any;
    }): Promise<any[]>;
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    findOne(conditions: any): Promise<any>;
}
