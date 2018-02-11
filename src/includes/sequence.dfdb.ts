/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Connection } from './connection.dfdb';
import { IDelayedResource, IResource } from './interface.resource.dfdb';
import { Collection } from './collection.dfdb';
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
    public connect(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        if (!this._loaded) {
            this._loaded = true;

            this._connection.loadFile(this._resourcePath, (error: string, data: string) => {
                if (error) {
                    this._connected = true;
                    this._value = 0;
                    this._skipSave = false;

                    this.save(done);
                } else if (data !== null) {
                    this._value = parseInt(data);
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

        if (this._loaded) {
            this.save(() => {
                this._value = 0;
                this._loaded = false;
                done();
            });
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
    protected resetError(): void {
        this._lastError = null;
    }
    protected save(done: any = null): void {
        this._connection.updateFile(this._resourcePath, `${this._value}`, () => {
            this._skipSave = false;
            done();
        }, this._skipSave);
    }
}
