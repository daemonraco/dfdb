/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import { queue } from 'async';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

import { BasicConstants, ConnectionSaveConstants, Errors } from './constants.dfdb';
import { DocsOnFileDB } from './manager.dfdb';
import { IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';

export class ConnectionSavingQueueResult {
    public error: string = null;
    public data: string = null;
}

export class Connection implements IResource {
    protected _collections: { [name: string]: Collection } = {};
    protected _connected: boolean = false;
    protected _dbFile: JSZip = null;
    protected _dbFullPath: string = null;
    protected _dbName: string = null;
    protected _dbPath: string = null;
    protected _lastError: string = null;
    protected _savingQueue: any = null;

    constructor(dbName: string, dbPath: string, options: any = {}) {
        this._dbName = dbName;
        this._dbPath = dbPath;
        this._dbFullPath = DocsOnFileDB.GuessDatabasePath(this._dbName, this._dbPath);
    }

    //
    // Public methods.
    public collection(name: string): Promise<Collection> {
        return new Promise<Collection>((resolve: (res: Collection) => void, reject: (err: string) => void) => {
            if (typeof this._collections[name] !== 'undefined') {
                resolve(this._collections[name]);
            } else {
                this._collections[name] = new Collection(name, this);
                this._collections[name].connect()
                .then(() => {
                    resolve(this._collections[name]);
                })
                .catch((err: string) => {
                        reject(err);
                    });
            }
        });
    }
    public connect(): Promise<boolean> {
        return new Promise<boolean>((resolve: (connected: boolean) => void, reject: (err: string) => void) => {
            //
            // Is it an empty directory?
            if (this.doesExist()) {
                this.internalConnect()
                    .then((c: boolean) => resolve(c))
                    .catch(reject);
            } else {
                this.createBasics()
                    .then(() => {
                        this.internalConnect()
                            .then((c: boolean) => resolve(c))
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    public connected(): boolean {
        return this._connected;
    }
    public close(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this.resetError();

            if (this._connected) {
                const collectionNames = Object.keys(this._collections);

                const run = () => {
                    const collectionName = collectionNames.shift();

                    if (collectionName) {
                        this._collections[collectionName].close()
                            .then(() => {
                                delete this._collections[collectionName];
                                run();
                            })
                            .catch(reject);
                    } else {
                        this._connected = false;
                        DocsOnFileDB.Instance().forgetConnection(this._dbName, this._dbPath);
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                }
                run();
            } else {
                resolve();
            }
        });
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public forgetCollection(name: string): boolean {
        let forgotten = false;

        if (typeof this._collections[name] !== 'undefined') {
            delete this._collections[name];
            forgotten = true;
        }

        return forgotten;
    }
    public lastError(): string | null {
        return this._lastError;
    }
    public loadFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: ConnectionSaveConstants.LoadFile,
                    path: zPath
                }, (result: ConnectionSavingQueueResult) => resolve(result));
            }
        });
    }
    public save(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._dbFile
                    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                    .pipe(fs.createWriteStream(this._dbFullPath))
                    .on('finish', resolve);
            } else {
                resolve();
            }
        });
    }
    public removeFile(zPath: string): Promise<ConnectionSavingQueueResult> {
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: ConnectionSaveConstants.RemoveFile,
                    path: zPath
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            }
        });
    }
    public updateFile(zPath: string, data: any, skipPhysicalSave: boolean = false): Promise<ConnectionSavingQueueResult> {
        return new Promise<ConnectionSavingQueueResult>((resolve: (res: ConnectionSavingQueueResult) => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._savingQueue.push({
                    action: ConnectionSaveConstants.UpdateFile,
                    path: zPath,
                    data, skipPhysicalSave
                }, (results: ConnectionSavingQueueResult) => resolve(results));
            }
        });
    }

    //
    // Protected methods.
    protected createBasics(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            const zip = new JSZip();
            zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', () => {
                    resolve();
                });
        });
    }
    protected doesExist(): boolean {
        let stat = null;
        try { stat = fs.statSync(this._dbFullPath); } catch (e) { }
        return stat !== null && stat.isFile();
    }
    protected internalConnect(): Promise<boolean> {
        this._connected = false;

        return new Promise<boolean>((resolve: (res: boolean) => void, reject: (err: string) => void) => {
            fs.readFile(this._dbFullPath, (error: any, data: any) => {
                if (error) {
                    this._lastError = `${Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                    reject(this._lastError);
                } else {
                    JSZip.loadAsync(data).then((zip: any) => {
                        this._dbFile = zip;
                        this._connected = true;
                        this.setSavingQueue();

                        resolve(this._connected);
                    }).catch((error: any) => {
                        this._lastError = `${Errors.DatabaseNotValid}. Path: '${this._dbFullPath}'. ${error}`;
                        reject(this._lastError);
                    });
                }
            });
        });
    }
    protected resetError(): void {
        this._lastError = null;
    }
    protected setSavingQueue(): void {
        this._savingQueue = queue((task: any, next: any) => {
            const resutls: ConnectionSavingQueueResult = new ConnectionSavingQueueResult();

            switch (task.action) {
                case ConnectionSaveConstants.LoadFile:
                    const file = this._dbFile.file(task.path);
                    if (file !== null) {
                        file.async('text').then((data: string) => {
                            resutls.data = data;
                            next(resutls);
                        });
                    } else {
                        resutls.error = `Zip path '${task.path}' does not exist`;
                        next(resutls);
                    }
                    break;
                case ConnectionSaveConstants.RemoveFile:
                    this._dbFile.remove(task.path);
                    next(resutls);
                    break;
                case ConnectionSaveConstants.UpdateFile:
                    this._dbFile.file(task.path, task.data);

                    if (!task.skipPhysicalSave) {
                        this.save()
                            .then(() => {
                                next(resutls);
                            })
                            .catch((err: string) => next(resutls));
                    } else {
                        next(resutls);
                    }
                    break;
                default:
                    resutls.error = `Unknown action '${task.action}'`;
                    next(resutls);
            }
        }, 1);
    }

    //
    // Protected methods.
    public static IsValidDatabase(dbName: string, dbPath: string): Promise<any> {
        return new Promise<any>((resolve: (res: any) => void, reject: (err: string) => void) => {
            const results: any = {
                exists: false,
                valid: false,
                error: null
            };

            const dbFullPath = DocsOnFileDB.GuessDatabasePath(dbName, dbPath);
            let stat: any = null;
            try { stat = fs.statSync(dbFullPath); } catch (e) { }

            if (stat) {
                results.exists = true;

                fs.readFile(dbFullPath, (error: any, data: any) => {
                    if (error) {
                        results.error = Errors.DatabaseDoesntExist;
                        resolve(results);
                    } else {
                        if (data.toString().substring(0, 2) === 'PK') {
                            results.valid = true;
                        } else {
                            results.error = Errors.DatabaseNotValid;
                        }
                        resolve(results);
                    }
                });
            } else {
                results.error = Errors.DatabaseDoesntExist;
                resolve(results);
            }
        });
    }
}