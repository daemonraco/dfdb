"use strict";
/**
 * @file file.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const async_1 = require("async");
const fs = require("fs");
const constants_dfdb_1 = require("../constants.dfdb");
const types_dfdb_1 = require("./types.dfdb");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
/**
 * This class holds Connection's specific logic to manpulate a database files.
 *
 * @class SubLogicFile
 */
class SubLogicFile extends sub_logic_dfdb_1.SubLogic {
    /**
     * This method centralizes all calls to load a file from inside the database
     * zip file.
     *
     * @method loadFile
     * @param {string} zPath Internal path to load.
     * @returns {Promise<ConnectionSavingQueueResult>} Returns a standarized
     * result object.
     */
    loadFile(zPath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                //
                // Piling up a new zip access operation to read a file.
                this._mainObject._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result) => resolve(result));
            }
            else {
                //
                // It should be connected to actually save.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
        });
    }
    /**
     * This method actually saves zip information physically.
     *
     * @method save
     * @returns {Promise<void>} Returns a promise that gets resovled when this
     * operation is finished.
     */
    save() {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
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
            }
            else {
                //
                // It should be connected to actually save.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
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
    removeFile(zPath) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                //
                // Piling up a new zip access operation to remove a file.
                this._mainObject._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
        });
    }
    /**
     * This method creates a queue to centralize all zip file access.
     *
     * @method setSavingQueue
     */
    setFileAccessQueue() {
        //
        // Creating a new queue.
        // @note It only allow 1 (one) access at a time.
        this._mainObject._fileAccessQueue = async_1.queue((task, next) => {
            //
            // Default values.
            const resutls = new types_dfdb_1.ConnectionSavingQueueResult();
            //
            // What action should it attend?
            switch (task.action) {
                case constants_dfdb_1.ConnectionSaveConstants.LoadFile:
                    //
                    // Retrieving file from zip.
                    const file = this._mainObject._dbFile.file(task.path);
                    //
                    // Does it exist?
                    if (file !== null) {
                        //
                        // Parsing and returning its connents.
                        file.async('text').then((data) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    }
                    else {
                        //
                        // Setting an error message and responding.
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.RemoveFile:
                    //
                    // Removing a file from zip.
                    this._mainObject._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case constants_dfdb_1.ConnectionSaveConstants.UpdateFile:
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
                            .catch((err) => next(resutls));
                    }
                    else {
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
    updateFile(zPath, data, skipPhysicalSave = false) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                this._mainObject._fileAccessQueue.push({
                    action: constants_dfdb_1.ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results) => resolve(results));
            }
            else {
                //
                // It should be connected to actually save.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
        });
    }
}
exports.SubLogicFile = SubLogicFile;
