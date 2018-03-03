import { IErrors } from '../errors.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
/**
 * This class represents and manipulates a database initialization structure.
 *
 * @class Initializer
 */
export declare class Initializer implements IErrors {
    protected static _JSONValidator: any;
    protected _asJSON: any;
    protected _asMD5: string;
    protected _collections: any[];
    protected _loaded: boolean;
    protected _subLogicErrors: SubLogicErrors<Initializer>;
    /**
     * @constructor
     */
    constructor();
    /**
     * Provides access to a listo of collections that has to be present in a
     * database using this initializer.
     *
     * @returns {any[]} Returns a list of collections.
     */
    collections(): any[];
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error(): boolean;
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError(): string | null;
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    lastRejection(): Rejection;
    /**
     * This method loads this initializer based on a JSON.
     *
     * @method loadFromJSON
     * @param {any} specs Specifications to load.
     * @returns {boolean} Returns TRUE when it successfully loaded.
     */
    loadFromJSON(specs: any): boolean;
    /**
     * This method loads this initializer based on a string.
     *
     * @method loadFromJSON
     * @param {string} specsStr Specifications to load.
     * @returns {boolean} Returns TRUE when it successfully loaded.
     */
    loadFromString(specsStr: string): boolean;
    /**
     * Provides access to this initializer represented as a MD5 hash.
     *
     * @method toMD5
     * @returns {string} Returns a unique hash code.
     */
    toMD5(): string;
    /**
     * Provides access to this initializer represented as a JSON.
     *
     * @method toJSON
     * @returns {string} Returns a JSON object.
     */
    toJSON(): any;
    /**
     * This method loads basic internal represantations of this initializer.
     *
     * @protected
     * @method buildAbstractions
     */
    protected buildAbstractions(): void;
    /**
     * This method provides access to a single instance of a JSON validator of all
     * initializers.
     *
     * @protected
     * @static
     * @method JSONValidator
     */
    protected static JSONValidator(): any;
}
