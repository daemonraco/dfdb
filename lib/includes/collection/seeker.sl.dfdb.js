"use strict";
/**
 * @file seeker.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
/**
 * This class holds Collection's generic logic related to document search.
 *
 * @class SubLogicSeeker
 */
class SubLogicSeeker extends sub_logic_dfdb_1.SubLogic {
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
    findIds(conditions) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing a list of indexes to involve.
            const indexesToUse = [];
            //
            // Selecting indexes to use.
            conditions.forEach((cond) => {
                //
                // Is current field on conditions indexed?
                if (typeof this._mainObject._indexes[cond.field()] === 'undefined') {
                    this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.NotIndexedField, { field: cond }));
                }
                else {
                    indexesToUse.push(cond.field());
                }
            });
            //
            // Was there an error selecting indexes?
            if (!this._mainObject.error()) {
                //
                // Initializing a list of IDs to return. By default, all documents
                // are considered to match conditions.
                let ids = Object.keys(this._mainObject._data);
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
                            .then((foundIds) => {
                            //
                            // Filtering and leaving only IDs that are present
                            // in the index.
                            ids = ids.filter(i => foundIds.indexOf(i) > -1);
                            //
                            // Recursion.
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        resolve(ids);
                    }
                };
                run();
            }
            else {
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
    idsToData(ids) {
        return ids.map((id) => this._mainObject._data[id]);
    }
}
exports.SubLogicSeeker = SubLogicSeeker;
