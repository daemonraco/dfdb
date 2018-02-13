/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';

import { Connection, ConnectionSavingQueueResult } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';

export class Sequence implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _lastError: string = null;
    protected _name: string = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _collection: Collection = null;
    protected _value: number = 0;

    //
    // Constructor.
    constructor(collection: Collection, name: string, connection: Connection) {
        this._name = name;
        this._collection = collection;
        this._connection = connection;

        this._resourcePath = `${this._collection.name()}/${this._name}.seq`;
    }

    //
    // Public methods.
    public connect(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (!this._connected) {
                this._connection.loadFile(this._resourcePath)
                    .then((results: ConnectionSavingQueueResult) => {
                        if (results.error) {
                            this._connected = true;
                            this._value = 0;
                            this._skipSave = false;

                            this.save()
                                .then(resolve)
                                .catch(reject);
                        } else if (results.data !== null) {
                            this._value = parseInt(results.data);
                            this._connected = true;
                            resolve();
                        }
                    })
                    .catch(reject);
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
                        this._value = 0;
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
                    .then((results: ConnectionSavingQueueResult) => {
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
    public lastError(): string {
        return this._lastError;
    }
    public next(): number {
        this._value++;
        this.save()
            .then(() => { })
            .catch(() => { });

        return this._value;
    }
    public skipSave(): void {
        this._skipSave = true;
    }

    //
    // Protected methods.
    protected resetError(): void {
        this._lastError = null;
    }
    protected save(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._connection.updateFile(this._resourcePath, `${this._value}`, this._skipSave)
                .then((results: ConnectionSavingQueueResult) => {
                    this._skipSave = false;
                    resolve();
                })
                .catch(reject);
        });
    }
}
