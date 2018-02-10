/**
 * @file table.dfdb.ts
 * @author Alejandro D. Simi
 */

import { BasicConstants, Errors } from './constants.dfdb';
import { IResource } from './interface.resource.dfdb';
import { Connection } from './connection.dfdb';
import { Index } from './index.dfdb';
import { Sequence } from './sequence.dfdb';
import * as JSZip from 'jszip';

export interface TableStep {
    params: any;
    function: any;
}

export class Table implements IResource {
    //
    // Protected properties.
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _indexes: { [name: string]: Index } = {};
    protected _lastError: string = null;
    protected _loaded: boolean = false;
    protected _manifest: { [name: string]: any } = {
        indexes: {}
    };
    protected _manifestPath: string = null;
    protected _name: string = null;
    protected _resourcePath: string = null;
    protected _sequence: Sequence = null;

    //
    // Constructor.
    constructor(name: string, connection: Connection) {
        this._name = name;
        this._connection = connection;

        this._manifestPath = `${this._name}/manifest`;
        this._resourcePath = `${this._name}/data.tab`;
    }

    //
    // Public methods.
    public addFieldIndex(name: string, done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (typeof this._indexes[name] === 'undefined') {
            this._manifest.indexes[name] = { name, field: name };
            this.loadIndexes(null, () => {
                let ids = Object.keys(this._data);

                const processIds = () => {
                    const id = ids.shift();
                    if (id) {
                        this._indexes[name].skipSave();
                        this._indexes[name].addDocument(this._data[id], processIds);
                    } else {
                        this.save(done);
                    }
                };
                processIds();
            });
        } else {
            this._lastError = `${Errors.DuplicatedIndex}. Index: ${name}.`
            done();
        }
    }
    public connect(done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (!this._loaded) {
            this._loaded = true;

            let steps: TableStep[] = [];
            steps.push({ params: {}, function: (params: any, next: any) => this.loadManifest(params, next) });
            steps.push({ params: {}, function: (params: any, next: any) => this.loadResource(params, next) });
            steps.push({ params: {}, function: (params: any, next: any) => this.loadSequence(params, next) });
            steps.push({ params: {}, function: (params: any, next: any) => this.loadIndexes(params, next) });

            this.processStepsSequence(steps, () => {
                done();
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
            let steps: TableStep[] = [];
            steps.push({
                params: {},
                function: (params: any, next: any) => {
                    this._sequence.skipSave();
                    this._sequence.close(() => {
                        this._sequence = null;
                        next();
                    })
                }
            });
            steps.push({ params: {}, function: (params: any, next: any) => this.closeIndexes(params, next) });

            this.processStepsSequence(steps, () => {
                this._data = {};
                this._loaded = false;
                this._connection.forgetTable(this._name);
                this.save(done);
            });
        } else {
            done();
        }
    }
    public dropFieldIndex(name: string, done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (typeof this._indexes[name] !== 'undefined') {
            this._indexes[name].drop(() => {
                this.save(() => {
                    delete this._manifest.indexes[name];
                    delete this._indexes[name];

                    done();
                });
            });
        } else {
            done();
        }
    }
    public error(): boolean {
        return this._lastError !== null;
    }
    public find(conditions: any, done: any): void {
        if (typeof conditions === 'function') {
            done = conditions;
            conditions = {};
        } else if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        if (done === null) {
            done = (findings: any[]) => { };
        }

        const findings: any[] = [];
        const indexesToUse: string[] = [];
        this.resetError();

        Object.keys(conditions).forEach(key => {
            if (typeof this._indexes[key] === 'undefined') {
                this._lastError = `${Errors.NotIndexedField}. Field: '${key}'.`
            } else {
                indexesToUse.push(key);
            }
        });

        if (!this.error()) {
            let ids: string[] = Object.keys(this._data);

            const run = () => {
                const idx = indexesToUse.shift();
                if (idx) {
                    this._indexes[idx].find(`${conditions[idx]}`, (foundIds: string[]) => {
                        if (ids === null) {
                            ids = foundIds;
                        } else {
                            ids.filter(i => foundIds.indexOf(i) > -1);
                        }
                        run();
                    })
                } else {
                    if (ids === null) {
                        ids = [];
                    }

                    ids.forEach(id => findings.push(this._data[id]));

                    done(findings);
                }
            }
            run();
        } else {
            done(findings);
        }
    }
    public findOne(conditions: any, done: any): void {
        if (typeof done === null) {
            done = (finding: any) => { };
        }

        this.find(conditions, (findings: any[]) => {
            if (findings.length > 0) {
                done(findings[0]);
            } else {
                done(null);
            }
        });
    }
    public insert(doc: any, done: any): void {
        if (done === null) {
            done = (inserted: any) => { };
        }

        this.resetError();

        if (typeof doc !== 'object' || Array.isArray(doc)) {
            this._lastError = Errors.DocIsNotObject;
            done(null);
        } else {
            this._sequence.skipSave();
            const newID = this._sequence.next();
            const newDate = new Date();
            doc._id = newID;
            doc._created = newDate;
            doc._updated = newDate;

            this._data[newID] = doc;

            this.addDocToIndexes(doc, () => {
                this.save(() => {
                    done(this._data[newID]);
                });
            });
        }
    }
    public lastError(): string {
        return this._lastError;
    }
    public name(): string {
        return this._name;
    }
    public remove(id: any, done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (typeof this._data[id] === 'undefined') {
            this._lastError = Errors.DocNotFound;
            done();
        } else {
            delete this._data[id];

            this.removeDocFromIndexes(id, () => {
                this.save(done);
            })
        }
    }
    public truncate(done: any): void {
        if (done === null) {
            done = () => { };
        }

        this.resetError();

        if (this._loaded) {
            this._data = {};
            this.truncateIndexes(null, () => this.save(done));
        } else {
            done();
        }
    }
    public update(id: any, doc: any, done: any): void {
        if (done === null) {
            done = (inserted: any) => { };
        }

        this.resetError();

        if (typeof doc !== 'object' || Array.isArray(doc)) {
            this._lastError = Errors.DocIsNotObject;
            done(null);
        } else if (typeof this._data[id] === 'undefined') {
            this._lastError = Errors.DocNotFound;
            done(null);
        } else {
            const currentDoc = this._data[id];
            doc._id = currentDoc._id;
            doc._created = currentDoc._created;
            doc._updated = new Date();

            this._data[id] = doc;

            this.removeDocFromIndexes(id, () => {
                this.addDocToIndexes(doc, () => {
                    this.save(() => {
                        done(this._data[id]);
                    });
                });
            });
        }
    }

    //
    // Protected methods.
    protected addDocToIndex(params: any, next: any): void {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].addDocument(params.doc, next);
    }
    protected addDocToIndexes(doc: any, next: any): void {
        let steps: any[] = [];

        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { doc, indexName },
                function: (params: any, next: any) => this.addDocToIndex(params, next)
            });
        })

        this.processStepsSequence(steps, next);
    }
    protected closeIndex(params: any, next: any): void {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].close(() => {
            delete this._indexes[params.indexName];
            next();
        });
    }
    protected closeIndexes(params: any, next: any): void {
        let steps: any[] = [];

        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { indexName },
                function: (params: any, next: any) => this.closeIndex(params, next)
            });
        })

        this.processStepsSequence(steps, next);
    }
    protected loadIndex(params: any, next: any): void {
        if (typeof this._indexes[params.name] === 'undefined') {
            this._indexes[params.name] = new Index(this, params.field, this._connection);
            this._indexes[params.name].connect(next);
        } else {
            next();
        }
    }
    protected loadIndexes(params: any, next: any): void {
        let steps: any[] = [];

        Object.keys(this._manifest.indexes).forEach(key => {
            steps.push({
                params: this._manifest.indexes[key],
                function: (params: any, next: any) => this.loadIndex(params, next)
            });
        })

        this.processStepsSequence(steps, next);
    }
    protected loadManifest(params: any, next: any): void {
        const file = this._connection.filePointer().file(this._manifestPath);
        if (file === null) {
            this._connection.filePointer().file(this._manifestPath, JSON.stringify(this._manifest));
            this._connection.save(() => {
                next();
            });
        } else {
            this._data = {};
            file.async('text').then((data: string) => {
                this._manifest = JSON.parse(data);
            });
            next();
        }
    }
    protected loadResource(params: any, next: any): void {
        const file = this._connection.filePointer().file(this._resourcePath);
        if (file === null) {
            this._connection.filePointer().file(this._resourcePath, '');
            this._connection.save(next);
        } else {
            this._data = {};
            file.async('text').then((data: string) => {
                data.split('\n')
                    .filter(line => line != '')
                    .forEach(line => {
                        const pieces = line.split('|', 1);
                        this._data[pieces[0]] = JSON.parse(pieces[1]);
                    });
            });
            next();
        }
    }
    protected loadSequence(params: any, next: any): void {
        this._sequence = new Sequence(this, BasicConstants.DefaultSequence, this._connection);
        this._sequence.connect(next);
    }
    protected processStepsSequence(steps: TableStep[], next: any): void {
        if (steps.length > 0) {
            const step = steps.shift();
            step.function(step.params, () => this.processStepsSequence(steps, next));
        } else {
            next();
        }
    }
    protected removeDocFromIndex(params: any, next: any): void {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].removeDocument(params.id, next);
    }
    protected removeDocFromIndexes(id: string, next: any): void {
        let steps: any[] = [];

        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { id, indexName },
                function: (params: any, next: any) => this.removeDocFromIndex(params, next)
            });
        })

        this.processStepsSequence(steps, next);
    }
    protected resetError(): void {
        this._lastError = null;
    }
    protected truncateIndex(params: any, next: any): void {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].truncate(next);
    }
    protected truncateIndexes(params: any, next: any): void {
        let steps: any[] = [];

        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { indexName },
                function: (params: any, next: any) => this.truncateIndex(params, next)
            });
        })

        this.processStepsSequence(steps, next);
    }
    protected save(done: any = null): void {
        let data: any = [];
        Object.keys(this._data).forEach(key => {
            data.push(`${key}|${JSON.stringify(this._data[key])}`);
        });

        this._connection.filePointer().file(this._manifestPath, JSON.stringify(this._manifest));
        this._connection.filePointer().file(this._resourcePath, data.join('\n'));
        this._connection.save(done);
    }
}
