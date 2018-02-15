/**
 * @file tools.dfdb.ts
 * @author Alejandro D. Simi
 */
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
}
