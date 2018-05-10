/**
 * @file tools.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as md5 from 'md5';

import { DBDocument } from './basic-types.dfdb';
import { Rejection } from './rejection.dfdb';

declare var process: any;

/**
 * Internal interfase that standardize recursive asynchronous calls to multiple
 * tasks.
 *
 * @interface IPromiseStep
 */
export interface IPromiseStep {
    /**
     * @property {any} params Data to use when a step is executed.
     */
    params: any;
    /**
     * @property {any} function Function to call on execution of this step. It
     * should returns a promise so it can be chained with other steps.
     */
    stepFunction: (params: any) => Promise<any>;
}

/**
 * This static class holds a list of tools used by DocsOnFileDB assets.
 *
 * @class Tools
 */
export class Tools {
    //
    // Constructor.
    /**
     * This class cannot be instantiated.
     *
     * @private
     * @constructor
     */
    private constructor() { }
    //
    // Public class methods.
    /**
     * Takes an object and returns a clone of it. It avoids using the same
     * pointer.
     *
     * @static
     * @method DeepCopy
     * @param {any} obj Object to be copied.
     * @returns {any} Returns a deep copy of the given object.
     */
    public static DeepCopy(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * Takes a document and returns a clone of it. It avoids using the same
     * pointer.
     *
     * @static
     * @method DeepCopyDocument
     * @param {DBDocument} obj Document to be copied.
     * @returns {DBDocument} Returns a deep copy of the given document.
     */
    public static DeepCopyDocument(doc: DBDocument): DBDocument {
        //
        // Basic cloning.
        let out: DBDocument = Tools.DeepCopy(doc);
        //
        // Reactivating date objects.
        out._created = new Date(out._created);
        out._updated = new Date(out._updated);

        return out;
    }
    /**
     * Takes a list of documents and returns a clone of them all. It avoids using
     * the same pointer.
     *
     * @static
     * @method DeepCopyDocuments
     * @param {DBDocument[]} obj List of documents to be copied.
     * @returns {DBDocument[]} Returns a deep copy of the given documents list.
     */
    public static DeepCopyDocuments(docs: DBDocument[]): DBDocument[] {
        //
        // Cloning.
        return docs.map((doc: DBDocument) => Tools.DeepCopyDocument(doc));
    }
    /**
     * This method takes two things that can be objects, arrays or simple values
     * and tries the deep-merge the second one into the first one.
     *
     * @static
     * @method DeepMergeObjects
     * @param {any} left Object to merge into.
     * @param {any} right Object from which take stuff to merge into the other
     * one.
     * @returns {any} Returns a merged object.
     */
    public static DeepMergeObjects(left: any, right: any): any {
        //
        // If the left item is an array or an object, then have special ways to
        // merge.
        if (Array.isArray(left)) {
            //
            // If both are arrays, the can be concatenated.
            if (Array.isArray(right)) {
                left = left.concat(right);
            }
        } else if (typeof left === 'object' && right !== null) {
            //
            // If both are objects, each properties of the right one have to go
            // into the left one.
            if (typeof right === 'object' && right !== null && !Array.isArray(right)) {
                Object.keys(right).forEach(key => {
                    left[key] = Tools.DeepMergeObjects(left[key], right[key]);
                });
            }
        } else {
            //
            // At this point, if the right one exist, it overwrites the left one.
            if (typeof right !== 'undefined') {
                left = right;
            }
        }

        return left;
    }
    /**
     * This method checks if certain PID is running.
     *
     * @static
     * @method IsPidRunning
     * @param {number} pid PID to check.
     * @returns {boolean} Returns TRUE when a process with the requested PID is
     * running.
     */
    public static IsPidRunning(pid: number): boolean {
        let out: boolean = false;

        try {
            process.kill(pid, 0);
            out = true;
        } catch (e) {
            out = e.code === 'EPERM';
        }

        return out;
    }
    /**
     * This method returns a unique hash string representing an object.
     *
     * @protected
     * @static
     * @method ObjectToMD5
     * @param {any} obj Object to represent.
     * @returns {string} Returns an MD5 hash.
     */
    public static ObjectToMD5(obj: any): string {
        return md5(JSON.stringify(obj));
    }
    /**
     * This method is a generic iterator of recursive asynchronous calls to
     * multiple tasks.
     *
     * @protected
     * @static
     * @method ProcessPromiseSteps
     * @param {IPromiseStep[]} steps List of steps to take.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public static ProcessPromiseSteps(steps: IPromiseStep[]): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Are there steps to process.
            if (steps.length > 0) {
                //
                // Picking a step to process
                const step = steps.shift();
                //
                // Executing the step and setting the recurtion for its callback
                step.stepFunction(step.params)
                    .then(() => Tools.ProcessPromiseSteps(steps).then(resolve).catch(reject))
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
}
