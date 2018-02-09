/**
 * @file connection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { BasicConstants } from './constants.dfdb';
import { DocsOnFileDB } from './manager.dfdb';
import { IResource } from './interface.resource.dfdb';
import { Table } from './table.dfdb';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

export class Connection implements IResource {
    protected _connected: boolean = false;
    protected _dbFile: JSZip = null;
    protected _dbFullPath: string = null;
    protected _dbName: string = null;
    protected _dbPath: string = null;
    protected _lastError: string = null;
    protected _tables: { [name: string]: Table } = {};

    constructor(dbName: string, dbPath: string, options: any = {}) {
        this._dbName = dbName;
        this._dbPath = dbPath;
        this._dbFullPath = path.join(this._dbPath, `${this._dbName}${BasicConstants.DBExtension}`);
    }

    //
    // Public methods.
    public connect(done: any): void {
        if (typeof done !== 'function') {
            done = (connected: boolean) => { };
        }
        //
        // Is it an empty directory?
        if (this.doesExist()) {
            this.internalConnect(done);
        } else {
            this.createBasics(() => {
                this.internalConnect(done);
            });
        }
    }
    public connected(): boolean {
        return this._connected;
    }
    public close(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._connected) {
            const tableNames = Object.keys(this._tables);

            const run = () => {
                const tableName = tableNames.shift();

                if (tableName) {
                    this._tables[tableName].close(() => {
                        delete this._tables[tableName];
                        run();
                    });
                } else {
                    this._connected = false;
                    DocsOnFileDB.instance().forgetConnection(this._dbName, this._dbPath);
                    this.save(done);
                }
            }
            run();
        } else {
            done();
        }
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public filePointer(): JSZip {
        return this._dbFile;
    }
    public forgetTable(name: string): boolean {
        let forgotten = false;

        if (typeof this._tables[name] !== 'undefined') {
            delete this._tables[name];
            forgotten = true;
        }

        return forgotten;
    }
    public lastError(): string | null {
        return this._lastError;
    }
    public table(name: string, done: any): void {
        if (done === null) {
            done = (table: Table) => { };
        }

        if (typeof this._tables[name] !== 'undefined') {
            done(this._tables[name]);
        } else {
            this._tables[name] = new Table(name, this);
            this._tables[name].connect(() => {
                done(this._tables[name]);
            });
        }
    }
    public save(done: any = null): void {
        if (done === null) {
            done = () => { };
        }

        if (this._connected) {
            this._dbFile
                .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(this._dbFullPath))
                .on('finish', done);
        } else {
            done();
        }
    }

    //
    // Protected methods.
    protected createBasics(done: any): void {
        const zip = new JSZip();
        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(this._dbFullPath))
            .on('finish', () => {
                done();
            });
    }
    protected doesExist(): boolean {
        let stat = null;
        try { stat = fs.statSync(this._dbFullPath); } catch (e) { }
        return stat !== null && stat.isFile();
    }
    protected internalConnect(done: any): void {
        this._connected = false;

        fs.readFile(this._dbFullPath, (error: any, data: any) => {
            if (error) {
                this._lastError = `Unable to load ${this._dbFullPath}. ${error}`;
                done(this._connected);
            } else {
                JSZip.loadAsync(data).then((zip: any) => {
                    this._dbFile = zip;
                    this._connected = true;

                    done(this._connected);
                }).catch((error: any) => {
                    this._lastError = `Unable to load ${this._dbFullPath}. ${error}`;
                    done(this._connected);
                });
            }
        });
    }
    protected resetError(): void {
        this._lastError = null;
    }
}