"use strict";
/**
 * @file search.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const jsonpath = require("jsonpath-plus");
const condition_dfdb_1 = require("../condition.dfdb");
const seeker_sl_dfdb_1 = require("./seeker.sl.dfdb");
/**
 * This class holds Collection's specific logic to find unindexed document field
 * values.
 *
 * @class SubLogicSearch
 */
class SubLogicSearch extends seeker_sl_dfdb_1.SubLogicSeeker {
    //
    // Public methods.
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    search(conditions) {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || Array.isArray(conditions)) {
            conditions = {};
        }
        const conditionsList = condition_dfdb_1.Condition.BuildConditionsSet(conditions);
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Default values.
            let findings = [];
            let foundIds = [];
            let indexedConditions = [];
            let unindexedConditions = [];
            //
            // Anonymous function to filter findings based on unindexed fields.
            const unindexedSearch = () => {
                //
                // Returning documents that match unindexed conditions.
                resolve(findings.filter((datum) => {
                    let accept = true;
                    //
                    // Checking each conditions.
                    unindexedConditions.forEach((cond) => {
                        //
                        // Parsing object for the right field.
                        const jsonPathValues = jsonpath({ json: datum, path: `\$.${cond.field()}` });
                        //
                        // Does current document have the field being checked. If
                        // not, it's filtered out.
                        if (typeof jsonPathValues[0] !== 'undefined') {
                            //
                            // Does it match?
                            accept = accept && cond.validate(jsonPathValues[0]);
                        }
                        else {
                            accept = false;
                        }
                    });
                    return accept;
                }));
            };
            //
            // Separating conditions for indexed fields from unindexed.
            conditionsList.forEach(cond => {
                if (typeof this._mainObject._indexes[cond.field()] === 'undefined') {
                    unindexedConditions.push(cond);
                }
                else {
                    indexedConditions.push(cond);
                }
            });
            //
            // Is there indexes conditions that can be used.
            if (indexedConditions.length > 0) {
                //
                // Getting ID of documents that match all conditions of indexed
                // fields.
                this.findIds(indexedConditions)
                    .then((ids) => {
                    //
                    // Converting ids into documents.
                    findings = this.idsToData(ids);
                    //
                    // Filtering based on unindexed conditions.
                    unindexedSearch();
                })
                    .catch(reject);
            }
            else {
                //
                // If there are no indexed conditions, all documents are
                // considered.
                findings = this.idsToData(Object.keys(this._mainObject._data));
                //
                // Filtering based on unindexed conditions.
                unindexedSearch();
            }
        });
    }
    /**
     * This is the same than 'searchOne()', but it returns only the first found
     * document.
     *
     * @method searchOne
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    searchOne(conditions) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Forwarding call.
            this.search(conditions)
                .then((findings) => {
                //
                // Picking the first found document.
                if (findings.length > 0) {
                    resolve(findings[0]);
                }
                else {
                    resolve(null);
                }
            })
                .catch(reject);
        });
    }
}
exports.SubLogicSearch = SubLogicSearch;
