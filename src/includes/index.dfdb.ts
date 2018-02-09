/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Errors } from './constants.dfdb';
import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Table } from './table.dfdb';
import * as JSZip from 'jszip';

export class Index implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _loaded: boolean = false;
    protected _field: string = null;
    protected _lastError: string = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _table: Table = null;

    //
    // Constructor.
    constructor(table: Table, field: string, connection: Connection) {
        this._field = field;
        this._table = table;
        this._connection = connection;

        this._resourcePath = `${this._table.name()}/${this._field}.idx`;
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

        if (!this._loaded) {
            this._loaded = true;
            const file = this._connection.filePointer().file(this._resourcePath);
            if (file === null) {
                this.save(done);
            } else {
                file.async('text').then((data: string) => {
                    data.split('\n')
                        .forEach(line => {
                            const pieces = line.split('|', 1);
                            this._data[pieces[0]] = pieces[1].split('|');
                        });

                    this._connected = true;
                    done();
                });
            }
        } else {
            done();
        }
    }
    public close(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._loaded) {
            this.save(done);
            this._data = {};
            this._loaded = false;
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
                        findings.push(id);
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

        if (this._loaded) {
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

        this._connection.filePointer().file(this._resourcePath, data.join('\n'));

        if (!this._skipSave) {
            this._connection.save(done);
        } else {
            done();
        }

        this._skipSave = false;
    }
}
