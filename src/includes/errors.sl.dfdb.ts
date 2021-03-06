/**
 * @file errors.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { IErrors } from './errors.i.dfdb';
import { Rejection } from './rejection.dfdb';
import { SubLogic } from './sub-logic.dfdb';

/**
 * This class holds specific sub-logic to manage and report errors.
 *
 * @class SubLogicErrors
 */
export class SubLogicErrors<T> extends SubLogic<T> implements IErrors {
    //
    // Protected properties.
    protected _lastError: string = null;
    protected _lastRejection: Rejection = null;
    //
    // Public methods.
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    public error(): boolean {
        return this._lastError !== null;
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
        return this._lastError;
    }
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    public lastRejection(): Rejection {
        return this._lastRejection;
    }
    /**
     * This method cleans up current error messages.
     *
     * @method resetError
     */
    public resetError(): void {
        this._lastError = null;
        this._lastRejection = null;
    }
    /**
     * Updates internal error values and messages.
     *
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    public setLastRejection(rejection: Rejection): void {
        this._lastError = `${rejection}`;
        this._lastRejection = rejection;
    }
}
