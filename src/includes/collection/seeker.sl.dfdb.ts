/**
 * @file seeker.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { ConditionsList, Condition } from '../condition.dfdb';
import { DBDocument, DBDocumentID } from '../basic-types.dfdb';
import { IOpenCollectionSeeker } from './open-collection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';

/**
 * This class holds Collection's generic logic related to document search.
 *
 * @class SubLogicSeeker
 */
export class SubLogicSeeker extends SubLogic<IOpenCollectionSeeker> {
    //
    // Protected methods.
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
    protected findIds(conditions: ConditionsList): Promise<string[]> {
        //
        // Building promise to return.
        return new Promise<string[]>((resolve: (res: string[]) => void, reject: (err: Rejection) => void) => {
            //
            // Initializing a list of indexes to involve.
            const indexesToUse: string[] = [];
            //
            // Selecting indexes to use.
            conditions.forEach((cond: Condition) => {
                //
                // Is current field on conditions indexed?
                if (typeof this._mainObject._indexes[cond.field()] === 'undefined') {
                    this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.NotIndexedField, { field: cond }));
                } else {
                    indexesToUse.push(cond.field());
                }
            });
            //
            // Was there an error selecting indexes?
            if (!this._mainObject.error()) {
                //
                // Initializing a list of IDs to return. By default, all documents
                // are considered to match conditions.
                let ids: string[] = Object.keys(this._mainObject._data);
                //
                // Recursive search in all selected indexes.
                const run = () => {
                    //
                    // Picking an index.
                    const idx = indexesToUse.shift();
                    //
                    // is there an index to process?
                    if (idx) {
                        //
                        // Requesting IDs from current index.
                        this._mainObject._indexes[idx].find(conditions)
                            .then((foundIds: string[]) => {
                                //
                                // Filtering and leaving only IDs that are present
                                // in the index.
                                ids = ids.filter(i => foundIds.indexOf(i) > -1);
                                //
                                // Recursion.
                                run();
                            })
                            .catch(reject);
                    } else {
                        resolve(ids);
                    }
                }
                run();
            } else {
                resolve([]);
            }
        });
    }
    /**
     * This method takes a list of IDs and returns a list of documents with those
     * IDs.
     *
     * @protected
     * @method idsToData
     * @param {string[]} ids List of IDs.
     * @returns {DBDocument[]} Returns a list of documents.
     */
    protected idsToData(ids: string[]): DBDocument[] {
        return ids.map((id: DBDocumentID) => this._mainObject._data[id]);
    }
}