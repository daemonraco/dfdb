/**
 * @file file.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import { queue } from 'async';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

import { ConnectionSaveConstants } from '../constants.dfdb';
import { ConnectionSavingQueueResult } from './types.dfdb';
import { IOpenConnectionFile } from './open-connection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';

export class SubLogicFile extends SubLogic<IOpenConnectionFile> {
    /**
     * This method centralizes all calls to load a file from inside the database
     * zip file.
     *
     * @method loadFile
     * @param {string} zPath Internal path to load.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    public loadFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                //
                // Piling up a new zip access operation to read a file.
                this._mainObject._fileAccessQueue.push({
                    action: ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result: ConnectionSavingQueueResult) => resolve(result));
            } else {
                //
                // It should be connected to actually save.
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * Thi method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    public save(): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                //
                // Updating internal manifest file's contents. If it doesn't
                // exist, it is created.
                this._mainObject._dbFile.file(this._mainObject._manifestPath, JSON.stringify(this._mainObject._manifest));
                //
                // Physcally saving.
                this._mainObject._dbFile
                    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                    .pipe(fs.createWriteStream(this._mainObject._dbFullPath))
                    .on('finish', resolve);
            } else {
                //
                // It should be connected to actually save.
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * This method centralizes all calls to remove a file from inside the database
     * zip file.
     *
     * @method removeFile
     * @param {string} zPath Internal path to remove.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    public removeFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                //
                // Piling up a new zip access operation to remove a file.
                this._mainObject._fileAccessQueue.push({
                    action: ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            } else {
                //
                // It should be connected to actually save.
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @method setSavingQueue
     */
    public setFileAccessQueue(): void {
        //
        // Creating a new queue.
        // @note It only allow 1 (one) access at a time.
        this._mainObject._fileAccessQueue = queue((task: any, next: (res: ConnectionSavingQueueResult) => void) => {
            //
            // Default values.
            const resutls: ConnectionSavingQueueResult = new ConnectionSavingQueueResult();
            //
            // What action should it attend?
            switch (task.action) {
                case ConnectionSaveConstants.LoadFile:
                    //
                    // Retrieving file from zip.
                    const file = this._mainObject._dbFile.file(task.path);
                    //
                    // Does it exist?
                    if (file !== null) {
                        //
                        // Parsing and returning its connents.
                        file.async('text').then((data: string) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    } else {
                        //
                        // Setting an error message and responding.
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case ConnectionSaveConstants.RemoveFile:
                    //
                    // Removing a file from zip.
                    this._mainObject._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case ConnectionSaveConstants.UpdateFile:
                    //
                    // Updating file's contents. If it doesn't exist, it is
                    // created.
                    this._mainObject._dbFile.file(task.path, task.data);
                    //
                    // Should the physical file be updated?
                    if (!task.skipPhysicalSave) {
                        this._mainObject.save()
                            .then(() => {
                                next(resutls);
                            })
                            .catch((err: string) => next(resutls));
                    } else {
                        next(resutls);
                    }
                    break;
                default:
                    //
                    // At this point, the requested action can't be attended.
                    resutls.error = `Unknown action '${task.action}'`;
                    next(resutls);
            }
        }, 1);
    }
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
    public updateFile(zPath: string, data: any, skipPhysicalSave: boolean = false): Promise<ConnectionSavingQueueResult> {
        //
        // Building promise to return.
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                this._mainObject._fileAccessQueue.push({
                    action: ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            } else {
                //
                // It should be connected to actually save.
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
}