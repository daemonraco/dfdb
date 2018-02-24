/**
 * @file search.sb.dfdb.ts
 * @author Alejandro D. Simi
 */

import * as jsonpath from 'jsonpath-plus';

import { Promise } from 'es6-promise';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SeekerSubLogic } from './seeker.sb.dfdb';

export class SearchSubLogic extends SeekerSubLogic {
    //
    // Public methods.
    /**
     * This method searches for documents that match certain criteria. Conditions
     * may include indexed and unindexed fields.
     *
     * @method search
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    public search(conditions: { [name: string]: any }): Promise<any[]> {
        //
        // Fixing conditions object.
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<any[]>((resolve: (res: any[]) => void, reject: (err: Rejection) => void) => {
            //
            // Default values.
            let findings: any[] = [];
            let foundIds: string[] = [];
            let indexedConditions: any = {};
            let unindexedConditions: any = {};
            //
            // Anonymous function to filter findings based on unindexed fields.
            const unindexedSearch = () => {
                //
                // List of unindexed fields.
                const unindexedConditionsKeys = Object.keys(unindexedConditions);
                //
                // Conditions sanitization. Values should be search un lower case
                // format.
                unindexedConditionsKeys.forEach((key: string) => unindexedConditions[key] = `${unindexedConditions[key]}`.toLowerCase());
                //
                // Returning documents that match unindexed conditions.
                resolve(findings.filter((datum: any) => {
                    let accept = true;
                    //
                    // Checking each conditions.
                    unindexedConditionsKeys.forEach((key: string) => {
                        //
                        // Parsing object for the right field.
                        const jsonPathValues = jsonpath({ json: datum, path: `\$.${key}` });
                        //
                        // Does current document have the field being checked. If
                        // not, it's filtered out.
                        if (typeof jsonPathValues[0] !== 'undefined') {
                            //
                            // Does it match?
                            if (`${jsonPathValues[0]}`.toLowerCase().indexOf(unindexedConditions[key]) < 0) {
                                accept = false;
                            }
                        } else {
                            accept = false;
                        }
                    });

                    return accept;
                }));
            };
            //
            // Separating conditions for indexed fields from unindexed.
            Object.keys(conditions).forEach(key => {
                if (typeof this._mainObject._indexes[key] === 'undefined') {
                    unindexedConditions[key] = conditions[key];
                } else {
                    indexedConditions[key] = conditions[key];
                }
            });
            //
            // Is there indexes conditions that can be used.
            if (Object.keys(indexedConditions).length > 0) {
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
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    public searchOne(conditions: { [name: string]: any }): Promise<any> {
        //
        // Building promise to return.
        return new Promise<any>((resolve: (res: any) => void, reject: (err: Rejection) => void) => {
            //
            // Forwarding call.
            this.search(conditions)
                .then((findings: any[]) => {
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