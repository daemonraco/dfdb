"use strict";
/**
 * @file find.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const condition_dfdb_1 = require("../condition.dfdb");
const seeker_sl_dfdb_1 = require("./seeker.sl.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Collection's specific logic to find indexed document field
 * values.
 *
 * @class SubLogicFind
 */
class SubLogicFind extends seeker_sl_dfdb_1.SubLogicSeeker {
    //
    // Public methods.
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    find(conditions) {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || Array.isArray(conditions)) {
            conditions = {};
        }
        const conditionsList = condition_dfdb_1.Condition.BuildConditionsSet(conditions);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing an empty list of findings.
            const findings = [];
            //
            // Forwarding the search to a method that searches and returns only
            // ids.
            this.findIds(conditionsList)
                .then((ids) => {
                //
                // Converting the list of IDs into a list of documents.
                ids.forEach(id => findings.push(this._mainObject._data[id]));
                //
                // Returning found documents.
                resolve(tools_dfdb_1.Tools.DeepCopy(findings));
            })
                .catch(reject);
        });
    }
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    findOne(conditions) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Forwading search.
            this.find(conditions)
                .then((findings) => {
                //
                // Picking the first document.
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
exports.SubLogicFind = SubLogicFind;
