/**
 * @file search.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as jsonpath from 'jsonpath-plus';

import { Condition, ConditionsList, SimpleConditionsList } from '../condition.dfdb';
import { DBDocument } from '../basic-types.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogicSeeker } from './seeker.sl.dfdb';
import { Tools } from '../tools.dfdb';

/**
 * This class holds Collection's specific logic to find unindexed document field
 * values.
 *
 * @class SubLogicSearch
 */
export class SubLogicSearch extends SubLogicSeeker {
    //
    // Public methods.
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
    public count(conditions: SimpleConditionsList): Promise<number> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<number>((resolve: (res: number) => void, reject: (err: Rejection) => void) => {
            //
            // Forwarding call.
            this.search(conditions).then((findings: DBDocument[]) => {
                //
                // Counting results.
                resolve(findings.length);
            }).catch(reject);
        });
    }
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {SimpleConditionsList} conditions Filtering conditions.
     * @returns {Promise<DBDocument[]>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns the list of found documents.
     */
    public search(conditions: SimpleConditionsList): Promise<DBDocument[]> {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || Array.isArray(conditions)) {
            conditions = {};
        }
        const conditionsList: ConditionsList = Condition.BuildConditionsSet(conditions);
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<DBDocument[]>((resolve: (res: DBDocument[]) => void, reject: (err: Rejection) => void) => {
            //
            // Default values.
            let findings: DBDocument[] = [];
            let foundIds: string[] = [];
            let indexedConditions: ConditionsList = [];
            let unindexedConditions: ConditionsList = [];
            //
            // Anonymous function to filter findings based on unindexed fields.
            const unindexedSearch = () => {
                //
                // Returning documents that match unindexed conditions.
                resolve(Tools.DeepCopyDocuments(findings.filter((datum: DBDocument) => {
                    let accept = true;
                    //
                    // Checking each conditions.
                    unindexedConditions.forEach((cond: Condition) => {
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
                        } else {
                            accept = false;
                        }
                    });

                    return accept;
                })));
            };
            //
            // Separating conditions for indexed fields from unindexed.
            conditionsList.forEach(cond => {
                if (typeof this._mainObject._indexes[cond.field()] === 'undefined') {
                    unindexedConditions.push(cond);
                } else {
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
                    .then((ids: string[]) => {
                        //
                        // Converting ids into documents.
                        findings = this.idsToData(ids);
                        //
                        // Filtering based on unindexed conditions.
                        unindexedSearch();
                    })
                    .catch(reject);
            } else {
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
     * @returns {Promise<DBDocument>} Returns a promise that gets resolved when the
     * search completes. In the promise it returns a found documents.
     */
    public searchOne(conditions: SimpleConditionsList): Promise<DBDocument> {
        //
        // Building promise to return.
        return new Promise<DBDocument>((resolve: (res: DBDocument) => void, reject: (err: Rejection) => void) => {
            //
            // Forwarding call.
            this.search(conditions)
                .then((findings: DBDocument[]) => {
                    //
                    // Picking the first found document.
                    if (findings.length > 0) {
                        resolve(findings[0]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(reject);
        });
    }
}