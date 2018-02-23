"use strict";
/**
 * @file find.sb.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const seeker_sb_dfdb_1 = require("./seeker.sb.dfdb");
class FindSubLogic extends seeker_sb_dfdb_1.SeekerSubLogic {
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
    find(conditions) {
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
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Initializing an empty list of findings.
            const findings = [];
            //
            // Forwarding the search to a method that searches and returns only
            // ids.
            this.findIds(conditions)
                .then((ids) => {
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
exports.FindSubLogic = FindSubLogic;
