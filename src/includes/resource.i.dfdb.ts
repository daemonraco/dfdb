/**
 * @file interface.resource.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

/**
 * This interfase specifies the required methods of an asset that represents a
 * file.
 *
 * @interface IResource
 */
export interface IResource {
    /**
     * Creating a resource representation object doesn't mean it is connected to
     * physical information, this method must do that.
     * It connects and loads information from the physical storage in zip file.
     *
     * @method connect
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    connect(): Promise<void>;
    /**
     * Provides a way to save current status and then close this resource.
     *
     * @method close
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    close(): Promise<void>;
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
}

/**
 * This interfase specifies the required methods of an asset that represents a
 * file and may not save information the first time is asked.
 *
 * @interface IResource
 */
export interface IDelayedResource {
    /**
     * When the physical file saving is trigger by a later action, this method
     * avoids next file save attempt for this resource.
     *
     * @method skipSave
     */
    skipSave(): void;
}