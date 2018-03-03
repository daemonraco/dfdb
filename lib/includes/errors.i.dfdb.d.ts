/**
 * @file errors.i.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Rejection } from './rejection.dfdb';
/**
 * This interfase holds all basic specifications of a class that reports errors.
 *
 * @interface IErrors
 */
export interface IErrors {
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
}
