/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Errors } from './constants.dfdb';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
import * as JSZip from 'jszip';

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
    public addDocument(doc: any, done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        if (typeof doc[this._field] !== 'undefined') {
            if (typeof doc[this._field] === 'object' && doc[this._field] !== null) {
                this._lastError = Errors.NotIndexableValue;
                done();
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

                this.save(done);
            }
        } else {
            done();
        }
    }
    public connect(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        if (!this._connected) {
            this._data = {};
            this._connection.loadFile(this._resourcePath, (error: string, data: string) => {
                if (error) {
                    this._connected = true;
                    this.save(done);
                } else if (data !== null) {
                    data.split('\n')
                        .filter(line => line != '')
                        .forEach(line => {
                            const pieces: string[] = line.split('|');
                            const key: string = pieces.shift();
                            this._data[key] = pieces;
                        });

                    this._connected = true;
                    done();
                }
            });
        } else {
            done();
        }
    }
    public close(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._connected) {
            this.save(() => {
                this._data = {};
                this._connected = false;
                done();
            });
        } else {
            done();
        }
    }
    public drop(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._connected) {
            this._connection.removeFile(this._resourcePath, () => {
                // no need to ask collection to forget this index because it's the
                // collection's responsibillity to invoke this method and then
                // forget it.

                this._connected = false;
                done();
            });
        } else {
            done();
        }
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public find(value: string, done: any): void {
        if (typeof done === null) {
            done = (ids: string[]) => { };
        }

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
        done(findings);
    }
    public lastError(): string {
        return this._lastError;
    }
    public removeDocument(id: string, done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        Object.keys(this._data).forEach(key => {
            const idx = this._data[key].indexOf(id);
            if (idx > -1) {
                this._data[key].splice(idx, 1);
            }
            if (this._data[key].length === 0) {
                delete this._data[key];
            }
        });

        this.save(done);
    }
    public skipSave(): void {
        this._skipSave = true;
    }
    public truncate(done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._connected) {
            this._data = {};
            this.save(done);
        } else {
            done();
        }
    }

    //
    // Protected methods.
    protected resetError(): void {
        this._lastError = null;
    }
    protected save(done: any = null): void {
        let data: any = [];
        Object.keys(this._data).forEach(key => {
            data.push(`${key}|${this._data[key].join('|')}`);
        });

        this._connection.updateFile(this._resourcePath, data.join('\n'), () => {
            this._skipSave = false;
            done();
        }, this._skipSave);
    }
}
