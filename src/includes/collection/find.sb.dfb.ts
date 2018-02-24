/**
 * @file find.sb.dfdb.ts
 * @author Alejandro D. Simi
 */

import * as jsonpath from 'jsonpath-plus';

import { Promise } from 'es6-promise';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SeekerSubLogic } from './seeker.sb.dfdb';

export class FindSubLogic extends SeekerSubLogic {
    //
    // Public methods.
    /**
     * This method searches for documents that match certain criteria. Conditions
     * should only include indexed fields.
     *
     * @method find
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any[]>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns the list of found documents.
     */
    public find(conditions: { [name: string]: any }): Promise<any[]> {
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
            // Initializing an empty list of findings.
            const findings: any[] = [];
            //
            // Forwarding the search to a method that searches and returns only
            // ids.
            this.findIds(conditions)
                .then((ids: string[]) => {
                    //
                    // Converting the list of IDs into a list of documents.
                    ids.forEach(id => findings.push(this._mainObject._data[id]));
                    //
                    // Returning found documents.
                    resolve(findings);
                })
                .catch(reject);
        });
    }
    /**
     * This is the same than 'find()', but it returns only the first found
     * document.
     *
     * @method findOne
     * @param {{[name:string]:any}} conditions Filtering conditions.
     * @returns {Promise<any>} Returns a promise that gets resolve when the
     * search completes. In the promise it returns a found documents.
     */
    public findOne(conditions: any): Promise<any> {
        //
        // Building promise to return.
        return new Promise<any>((resolve: (res: any) => void, reject: (err: Rejection) => void) => {
            //
            // Forwading search.
            this.find(conditions)
                .then((findings: any[]) => {
                    //
                    // Picking the first document.
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