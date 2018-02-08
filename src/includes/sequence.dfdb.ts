/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Table } from './table.dfdb';
import * as JSZip from 'jszip';

export class Sequence implements IResource, IDelayedResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _lastError: string = null;
    protected _loaded: boolean = false;
    protected _name: string = null;
    protected _resourcePath: string = null;
    protected _skipSave: boolean = false;
    protected _table: Table = null;
    protected _value: number = 0;

    //
    // Constructor.
    constructor(table: Table, name: string, connection: Connection) {
        this._name = name;
        this._table = table;
        this._connection = connection;

        this._resourcePath = `${this._table.name()}/${this._name}.seq`;
    }

    //
    // Public methods.
    public connect(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        if (!this._loaded) {
            this._loaded = true;
            const file = this._connection.filePointer().file(this._resourcePath);
            if (file === null) {
                this._connected = true;
                this._value = 0;
                this._skipSave = false;

                this.save(done);
            } else {
                file.async('text').then((x: string) => {
                    this._value = parseInt(x);
                    this._connected = true;
                    done();
                });
            }
        } else {
            done();
        }
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public lastError(): string {
        return this._lastError;
    }
    public next(): number {
        this._value++;
        this.save(() => { });

        return this._value;
    }
    public skipSave(): void {
        this._skipSave = true;
    }

    //
    // Protected methods.
    protected save(done: any = null): void {
        this._connection.filePointer().file(this._resourcePath, `${this._value}`);

        if (!this._skipSave) {
            this._connection.save(done);
        } else {
            done();
        }

        this._skipSave = false;
    }
}
