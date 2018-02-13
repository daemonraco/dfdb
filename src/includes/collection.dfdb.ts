/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as JSZip from 'jszip';

import { BasicConstants, Errors } from './constants.dfdb';
import { IResource } from './interface.resource.dfdb';
import { Connection, ConnectionSavingQueueResult } from './connection.dfdb';
import { Index } from './index.dfdb';
import { Sequence } from './sequence.dfdb';

export interface CollectionStep {
    params: any;
    function: any;
}

export class Collection implements IResource {
    //
    // Protected properties.
    protected _connected: boolean = false;
    protected _connection: Connection = null;
    protected _data: { [name: string]: any } = {};
    protected _indexes: { [name: string]: Index } = {};
    protected _lastError: string = null;
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
        this._resourcePath = `${this._name}/data.col`;
    }

    //
    // Public methods.
    public addFieldIndex(name: string): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected && typeof this._indexes[name] === 'undefined') {
                this._manifest.indexes[name] = { name, field: name };
                this.loadIndexes(null)
                    .then(() => {
                        let ids = Object.keys(this._data);

                        const processIds = () => {
                            const id = ids.shift();
                            if (id) {
                                this._indexes[name].skipSave();
                                this._indexes[name].addDocument(this._data[id])
                                    .then(processIds)
                                    .catch(reject);
                            } else {
                                this.save()
                                    .then(resolve)
                                    .catch(reject);
                            }
                        };
                        processIds();
                    })
                    .catch(reject);
            } else if (!this._connected) {
                this._lastError = Errors.CollectionNotConnected;
                reject(this._lastError);
            } else {
                this._lastError = `${Errors.DuplicatedIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
    }
    public connect(): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (!this._connected) {
                let steps: CollectionStep[] = [];
                steps.push({ params: {}, function: (params: any) => this.loadManifest(params) });
                steps.push({ params: {}, function: (params: any) => this.loadResource(params) });
                steps.push({ params: {}, function: (params: any) => this.loadSequence(params) });
                steps.push({ params: {}, function: (params: any) => this.loadIndexes(params) });

                this.processStepsSequence(steps)
                    .then(() => {
                        this._connected = true;
                        resolve();
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
                let steps: CollectionStep[] = [];
                steps.push({
                    params: {},
                    function: (params: any) => {
                        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
                            this._sequence.skipSave();
                            this._sequence.close()
                                .then(() => {
                                    this._sequence = null;
                                    resolve();
                                })
                                .catch(reject);
                        });
                    }
                });
                steps.push({ params: {}, function: (params: any) => this.closeIndexes(params) });

                this.processStepsSequence(steps)
                    .then(() => {
                        this._connection.forgetCollection(this._name);
                        this.save()
                            .then(() => {
                                this._data = {};
                                this._connected = false;
                                resolve();
                            })
                            .catch(reject);
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
                let steps: CollectionStep[] = [];
                steps.push({ params: {}, function: (params: any) => this.dropIndexes(params) });
                steps.push({ params: {}, function: (params: any) => this.dropSequence(params) });
                steps.push({ params: {}, function: (params: any) => this.dropResource(params) });
                steps.push({ params: {}, function: (params: any) => this.dropManifest(params) });

                this.processStepsSequence(steps)
                    .then(() => {
                        this._connected = false;
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    public dropFieldIndex(name: string): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (typeof this._indexes[name] !== 'undefined') {
                this._indexes[name].drop()
                    .then(() => {
                        this.save()
                            .then(() => {
                                delete this._manifest.indexes[name];
                                delete this._indexes[name];

                                resolve();
                            })
                            .catch(reject);
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
    public find(conditions: any): Promise<any[]> {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }

        this.resetError();

        return new Promise<any[]>((resolve: (res: any[]) => void, reject: (err: string) => void) => {
            const findings: any[] = [];

            this.findIds(conditions)
                .then((ids: string[]) => {
                    ids.forEach(id => findings.push(this._data[id]));
                    resolve(findings);
                })
                .catch(reject);
        });
    }
    public findOne(conditions: any): Promise<any> {
        return new Promise<any>((resolve: (res: any) => void, reject: (err: string) => void) => {
            this.find(conditions)
                .then((findings: any[]) => {
                    if (findings.length > 0) {
                        resolve(findings[0]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(reject);
        });
    }
    public insert(doc: any): Promise<any> {
        this.resetError();

        return new Promise<any>((resolve: (res: any) => void, reject: (err: string) => void) => {
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = Errors.DocIsNotObject;
                reject(this._lastError);
            } else if (!this._connected) {
                this._lastError = Errors.CollectionNotConnected;
                reject(this._lastError);
            } else {
                this._sequence.skipSave();
                const newID = this._sequence.next();
                const newDate = new Date();
                doc._id = newID;
                doc._created = newDate;
                doc._updated = newDate;

                this._data[newID] = doc;

                this.addDocToIndexes(doc)
                    .then(() => {
                        this.save()
                            .then(() => {
                                resolve(this._data[newID]);
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    public lastError(): string {
        return this._lastError;
    }
    public name(): string {
        return this._name;
    }
    public rebuildFieldIndex(name: string): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected && typeof this._indexes[name] !== 'undefined') {
                this.dropFieldIndex(name)
                    .then(() => {
                        this.addFieldIndex(name)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else if (!this._connected) {
                this._lastError = Errors.CollectionNotConnected;
                reject(this._lastError);
            } else {
                this._lastError = `${Errors.UnknownIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
    }
    public remove(id: any): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (!this._connected) {
                this._lastError = Errors.CollectionNotConnected;
                reject(this._lastError);
            } else if (typeof this._data[id] === 'undefined') {
                this._lastError = Errors.DocNotFound;
                reject(this._lastError);
            } else {
                delete this._data[id];

                this.removeDocFromIndexes(id)
                    .then(() => {
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    public search(conditions: any): Promise<any[]> {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }

        return new Promise<any[]>((resolve: (res: any[]) => void, reject: (err: string) => void) => {
            let findings: any[] = [];
            let foundIds: string[] = [];
            let indexedConditions: any = {};
            let unindexedConditions: any = {};

            const unindexedSearch = () => {
                const unindexedConditionsKeys = Object.keys(unindexedConditions);

                unindexedConditionsKeys.forEach((key: string) => unindexedConditions[key] = unindexedConditions[key].toLowerCase());

                resolve(findings.filter((datum: any) => {
                    let accept = true;

                    unindexedConditionsKeys.forEach((key: string) => {
                        if (typeof datum[key] === 'undefined') {
                            accept = false;
                        } else {
                            if (`${datum[key]}`.toLowerCase().indexOf(unindexedConditions[key]) < 0) {
                                accept = false;
                            }
                        }
                    });

                    return accept;
                }));
            };

            this.resetError();

            Object.keys(conditions).forEach(key => {
                if (typeof this._indexes[key] === 'undefined') {
                    unindexedConditions[key] = conditions[key];
                } else {
                    indexedConditions[key] = conditions[key];
                }
            });

            if (Object.keys(indexedConditions).length > 0) {
                this.findIds(indexedConditions)
                    .then((ids: string[]) => {
                        findings = this.idsToData(ids);
                        unindexedSearch();
                    })
                    .catch(reject);
            } else {
                findings = this.idsToData(Object.keys(this._data));
                unindexedSearch();
            }
        });
    }
    public searchOne(conditions: any): Promise<any> {
        return new Promise<any>((resolve: (res: any) => void, reject: (err: string) => void) => {
            this.search(conditions)
                .then((findings: any[]) => {
                    if (findings.length > 0) {
                        resolve(findings[0]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(reject);
        });
    }
    public truncate(): Promise<void> {
        this.resetError();

        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (this._connected) {
                this._data = {};
                this.truncateIndexes(null)
                    .then(() => {
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    public update(id: any, doc: any): Promise<any> {
        this.resetError();

        return new Promise<any>((resolve: (res: any) => void, reject: (err: string) => void) => {
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = Errors.DocIsNotObject;
                reject(this._lastError);
            } else if (typeof this._data[id] === 'undefined') {
                this._lastError = Errors.DocNotFound;
                reject(this._lastError);
            } else if (!this._connected) {
                this._lastError = Errors.CollectionNotConnected;
                reject(this._lastError);
            } else {
                const currentDoc = this._data[id];
                doc._id = currentDoc._id;
                doc._created = currentDoc._created;
                doc._updated = new Date();

                this._data[id] = doc;

                this.removeDocFromIndexes(id)
                    .then(() => {
                        this.addDocToIndexes(doc).
                            then(() => {
                                this.save()
                                    .then(() => {
                                        resolve(this._data[id]);
                                    })
                                    .catch(reject);
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }

    //
    // Protected methods.
    protected addDocToIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].addDocument(params.doc)
                .then(resolve)
                .catch(reject);
        });
    }
    protected addDocToIndexes(doc: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { doc, indexName },
                    function: (params: any) => this.addDocToIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected closeIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].close()
                .then(() => {
                    delete this._indexes[params.indexName];
                    resolve();
                })
                .catch(reject);
        });
    }
    protected closeIndexes(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params: any) => this.closeIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected dropIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            delete this._manifest.indexes[params.indexName];
            this._indexes[params.indexName].drop()
                .then(() => {
                    delete this._indexes[params.indexName];
                    resolve();
                })
                .catch(reject);
        });
    }
    protected dropIndexes(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params: any) => this.dropIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected dropManifest(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._connection.removeFile(this._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    this._manifest = {};
                    resolve();
                })
                .catch(reject);
        });
    }
    protected dropResource(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._connection.removeFile(this._resourcePath)
                .then((results: ConnectionSavingQueueResult) => {
                    this._data = {};
                    resolve();
                })
                .catch(reject);
        });
    }
    protected dropSequence(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._sequence.drop()
                .then(() => {
                    this._sequence = null;
                    resolve();
                })
                .catch(reject);
        });
    }
    protected findIds(conditions: any): Promise<string[]> {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }

        return new Promise<string[]>((resolve: (res: string[]) => void, reject: (err: string) => void) => {
            const indexesToUse: string[] = [];

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
                        this._indexes[idx].find(`${conditions[idx]}`)
                            .then((foundIds: string[]) => {
                                ids = ids.filter(i => foundIds.indexOf(i) > -1);
                                run();
                            })
                            .catch(reject);
                    } else {
                        resolve(ids);
                    }
                }
                run();
            } else {
                resolve([]);
            }
        });
    }
    protected idsToData(ids: string[]): any[] {
        return ids.map(id => this._data[id]);
    }
    protected loadIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (typeof this._indexes[params.name] === 'undefined') {
                this._indexes[params.name] = new Index(this, params.field, this._connection);
                this._indexes[params.name].connect()
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    protected loadIndexes(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._manifest.indexes).forEach(key => {
                steps.push({
                    params: this._manifest.indexes[key],
                    function: (params: any) => this.loadIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected loadManifest(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._connection.loadFile(this._manifestPath)
                .then((results: ConnectionSavingQueueResult) => {
                    if (results.error) {
                        this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
                        this._manifest = JSON.parse(results.data);
                        resolve();
                    }
                })
                .catch(reject);
        });
    }
    protected loadResource(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._data = {};
            this._connection.loadFile(this._resourcePath)
                .then((results: ConnectionSavingQueueResult) => {
                    if (results.error) {
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    } else if (results.data !== null) {
                        results.data.split('\n')
                            .filter(line => line != '')
                            .forEach(line => {
                                const pieces = line.split('|');
                                const id = pieces.shift();
                                this._data[id] = JSON.parse(pieces.join('|'));
                            });
                        resolve();
                    }
                })
                .catch(reject);
        });
    }
    protected loadSequence(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._sequence = new Sequence(this, BasicConstants.DefaultSequence, this._connection);
            this._sequence.connect()
                .then(resolve)
                .catch(reject);
        });
    }
    protected processStepsSequence(steps: CollectionStep[]): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            if (steps.length > 0) {
                const step = steps.shift();
                step.function(step.params)
                    .then(() => this.processStepsSequence(steps).then(resolve).catch(reject))
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    protected removeDocFromIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._indexes[params.indexName].skipSave();

            this._indexes[params.indexName].removeDocument(params.id)
                .then(resolve)
                .catch(reject);
        });
    }
    protected removeDocFromIndexes(id: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { id, indexName },
                    function: (params: any) => this.removeDocFromIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected resetError(): void {
        this._lastError = null;
    }
    protected truncateIndex(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].truncate()
                .then(resolve)
                .catch(reject);
        });
    }
    protected truncateIndexes(params: any): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let steps: any[] = [];

            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params: any) => this.truncateIndex(params)
                });
            })

            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    protected save(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
            let data: any = [];
            Object.keys(this._data).forEach(id => {
                data.push(`${id}|${JSON.stringify(this._data[id])}`);
            });

            this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                .then((mResults: ConnectionSavingQueueResult) => {
                    this._connection.updateFile(this._resourcePath, data.join('\n'))
                        .then((rResults: ConnectionSavingQueueResult) => {
                            resolve();
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}
