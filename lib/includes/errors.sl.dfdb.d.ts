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
export declare class SubLogicErrors<T> extends SubLogic<T> implements IErrors {
    protected _lastError: string;
    protected _lastRejection: Rejection;
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
     * This method cleans up current error messages.
     *
     * @method resetError
     */
    resetError(): void;
    /**
     * Updates internal error values and messages.
     *
     * @method setLastRejection
     * @param {Rejection} rejection Rejection object to store as last error.
     */
    setLastRejection(rejection: Rejection): void;
}
