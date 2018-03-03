/**
 * @file tools.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
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
export declare class Tools {
    /**
     * This class cannot be instantiated.
     *
     * @private
     * @constructor
     */
    private constructor();
    /**
     * Takes an object and returns a clone of if. It avoids using the same
     * pointer.
     *
     * @static
     * @method DeepCopy
     * @param {any} obj Object to be copied.
     * @returns {any} Returns a deep copy of the given object.
     */
    static DeepCopy(obj: any): any;
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
    static DeepMergeObjects(left: any, right: any): any;
    /**
     * This method returns a unique hash string representing an object.
     *
     * @protected
     * @static
     * @method ObjectToMD5
     * @param {any} obj Object to represent.
     * @returns {string} Returns an MD5 hash.
     */
    static ObjectToMD5(obj: any): string;
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
    static ProcessPromiseSteps(steps: IPromiseStep[]): Promise<void>;
}
