/**
 * @file file.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { ConnectionSavingQueueResult } from './types.dfdb';
import { IOpenConnectionFile } from './open-connection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Connection's specific logic to manpulate a database files.
 *
 * @class SubLogicFile
 */
export declare class SubLogicFile extends SubLogic<IOpenConnectionFile> {
    /**
     * This method centralizes all calls to load a file from inside the database
     * zip file.
     *
     * @method loadFile
     * @param {string} zPath Internal path to load.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    loadFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    /**
     * This method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    save(): Promise<void>;
    /**
     * This method centralizes all calls to remove a file from inside the database
     * zip file.
     *
     * @method removeFile
     * @param {string} zPath Internal path to remove.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    removeFile(zPath: string): Promise<ConnectionSavingQueueResult>;
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @method setSavingQueue
     */
    setFileAccessQueue(): void;
    /**
     * This method centralizes all calls to update contents of a file inside the
     * database zip file.
     *
     * @method updateFile
     * @param {string} zPath Internal path to remove.
     * @param {any} data Information to be stored.
     * @param {boolean} skipPhysicalSave After virtually updating the file, should
     * physical storage be updated?
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    updateFile(zPath: string, data: any, skipPhysicalSave?: boolean): Promise<ConnectionSavingQueueResult>;
}
