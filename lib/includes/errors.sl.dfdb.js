"use strict";
/**
 * @file errors.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sub_logic_dfdb_1 = require("./sub-logic.dfdb");
/**
 * This class holds specific sub-logic to manage and report errors.
 *
 * @class SubLogicErrors
 */
class SubLogicErrors extends sub_logic_dfdb_1.SubLogic {
    constructor() {
        super(...arguments);
        //
        // Protected properties.
        this._lastError = null;
        this._lastRejection = null;
    }
    //
    // Public methods.
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error() {
        return this._lastError !== null;
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    lastError() {
        return this._lastError;
    }
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    lastRejection() {
        return this._lastRejection;
    }
    /**
     * This method cleans up current error messages.
     *
     * @method resetError
     */
    resetError() {
        this._lastError = null;
        this._lastRejection = null;
    }
    /**
     * Updates internal error values and messages.
     *
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    setLastRejection(rejection) {
        this._lastError = `${rejection}`;
        this._lastRejection = rejection;
    }
}
exports.SubLogicErrors = SubLogicErrors;
