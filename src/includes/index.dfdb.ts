/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';

import { Errors } from './constants.dfdb';
import { Connection, ConnectionSavingQueueResult } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';

export class Index implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _field: string = null;
    protected _lastError: string = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _collection: Collection = null;

    //
    // Constructor.
    constructor(collection: Collection, field: string, connection: Connection) {
        this._field = field;
        this._collection = collection;
        this._connection = connection;

        this._resourcePath = `${this._collection.name()}/${this._field}.idx`;
    }

    //
    // Public methods.
    public addDocument(doc: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (typeof doc[this._field] !== 'undefined') {
                if (typeof doc[this._field] === 'object' && doc[this._field] !== null) {
                    this._lastError = Errors.NotIndexableValue;
                    reject(this._lastError);
                } else {
                    const value = `${doc[this._field]}`.toLowerCase();
                    if (typeof this._data[value] === 'undefined') {
                        this._data[value] = [doc._id];
                    } else {
                        if (this._data[value].indexOf(doc._id) < 0) {
                            this._data[value].push(doc._id);
                            this._data[value].sort();
                        }
                    }

                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
            } else {
                resolve();
            }
        });
    }
    public connect(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (!this._connected) {
                this._data = {};
                this._connection.loadFile(this._resourcePath)
                    .then((results: ConnectionSavingQueueResult) => {
                        if (results.error) {
                            this._connected = true;
                            this.save()
                                .then(resolve)
                                .catch(reject);
                        } else if (results.data !== null) {
                            results.data.split('\n')
                                .filter(line => line != '')
                                .forEach(line => {
                                    const pieces: string[] = line.split('|');
                                    const key: string = pieces.shift();
                                    this._data[key] = pieces;
                                });

                            this._connected = true;
                            resolve();
                        }
                    });
            } else {
                resolve();
            }
        });
    }
    public close(): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected) {
                this.save()
                    .then(() => {
                        this._data = {};
                        this._connected = false;
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    public drop(): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._connection.removeFile(this._resourcePath)
                    .then(() => {
                        // no need to ask collection to forget this index because it's the
                        // collection's responsibillity to invoke this method and then
                        // forget it.

                        this._connected = false;
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public find(value: string): Promise<string[]> {
        return new Promise<string[]>((resolve: (res: string[]) => void, reject: (err: string) => void) => {
            value = value.toLowerCase();

            const findings: string[] = [];
            this.resetError();

            Object.keys(this._data).forEach((indexValue: string) => {
                if (indexValue.indexOf(value) > -1) {
                    this._data[indexValue].forEach((id: string) => {
                        if (findings.indexOf(id) < 0) {
                            findings.push(`${id}`);
                        }
                    });
                }
            });

            findings.sort();
            resolve(findings);
        });
    }
    public lastError(): string {
        return this._lastError;
    }
    public removeDocument(id: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            Object.keys(this._data).forEach(key => {
                const idx = this._data[key].indexOf(id);
                if (idx > -1) {
                    this._data[key].splice(idx, 1);
                }
                if (this._data[key].length === 0) {
                    delete this._data[key];
                }
            });

            this.save()
                .then(resolve)
                .catch(reject);
        });
    }
    public skipSave(): void {
        this._skipSave = true;
    }
    public truncate(): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._data = {};
                this.save()
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    //
    // Protected methods.
    protected resetError(): void {
        this._lastError = null;
    }
    protected save(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let data: any = [];
            Object.keys(this._data).forEach(key => {
                data.push(`${key}|${this._data[key].join('|')}`);
            });

            this._connection.updateFile(this._resourcePath, data.join('\n'), this._skipSave)
                .then((results: ConnectionSavingQueueResult) => {
                    this._skipSave = false;
                    resolve();
                })
                .catch(reject);
        });
    }
}
