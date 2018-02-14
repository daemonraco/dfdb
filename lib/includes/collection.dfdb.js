"use strict";
/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const constants_dfdb_1 = require("./constants.dfdb");
const index_dfdb_1 = require("./index.dfdb");
const sequence_dfdb_1 = require("./sequence.dfdb");
/**
 * This class represents a collection and provides access to all its information
 * and associated objects.
 *
 * @class Collection
 */
class Collection {
    //
    // Constructor.
    constructor(name, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._data = {};
        this._indexes = {};
        this._lastError = null;
        this._manifest = {
            indexes: {}
        };
        this._manifestPath = null;
        this._name = null;
        this._resourcePath = null;
        this._sequence = null;
        this._name = name;
        this._connection = connection;
        this._manifestPath = `${this._name}/manifest`;
        this._resourcePath = `${this._name}/data.col`;
    }
    //
    // Public methods.
    addFieldIndex(name) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
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
                        }
                        else {
                            this.save()
                                .then(resolve)
                                .catch(reject);
                        }
                    };
                    processIds();
                })
                    .catch(reject);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
                this._lastError = `${constants_dfdb_1.Errors.DuplicatedIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
    }
    connect() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (!this._connected) {
                let steps = [];
                steps.push({ params: {}, function: (params) => this.loadManifest(params) });
                steps.push({ params: {}, function: (params) => this.loadResource(params) });
                steps.push({ params: {}, function: (params) => this.loadSequence(params) });
                steps.push({ params: {}, function: (params) => this.loadIndexes(params) });
                this.processStepsSequence(steps)
                    .then(() => {
                    this._connected = true;
                    resolve();
                })
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    close() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                let steps = [];
                steps.push({
                    params: {},
                    function: (params) => {
                        return new es6_promise_1.Promise((resolve, reject) => {
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
                steps.push({ params: {}, function: (params) => this.closeIndexes(params) });
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
            }
            else {
                resolve();
            }
        });
    }
    drop() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                let steps = [];
                steps.push({ params: {}, function: (params) => this.dropIndexes(params) });
                steps.push({ params: {}, function: (params) => this.dropSequence(params) });
                steps.push({ params: {}, function: (params) => this.dropResource(params) });
                steps.push({ params: {}, function: (params) => this.dropManifest(params) });
                this.processStepsSequence(steps)
                    .then(() => {
                    this._connected = false;
                    resolve();
                })
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    dropFieldIndex(name) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
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
            }
            else {
                resolve();
            }
        });
    }
    error() {
        return this._lastError !== null;
    }
    find(conditions) {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            const findings = [];
            this.findIds(conditions)
                .then((ids) => {
                ids.forEach(id => findings.push(this._data[id]));
                resolve(findings);
            })
                .catch(reject);
        });
    }
    findOne(conditions) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this.find(conditions)
                .then((findings) => {
                if (findings.length > 0) {
                    resolve(findings[0]);
                }
                else {
                    resolve(null);
                }
            })
                .catch(reject);
        });
    }
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    hasIndex(name) {
        return typeof this._manifest.indexes[name] !== 'undefined';
    }
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    indexes() {
        return JSON.parse(JSON.stringify(this._manifest.indexes));
    }
    insert(doc) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
                reject(this._lastError);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
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
    lastError() {
        return this._lastError;
    }
    name() {
        return this._name;
    }
    rebuildFieldIndex(name) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected && typeof this._indexes[name] !== 'undefined') {
                this.dropFieldIndex(name)
                    .then(() => {
                    this.addFieldIndex(name)
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
                this._lastError = `${constants_dfdb_1.Errors.UnknownIndex}. Index: '${name}'`;
                reject(this._lastError);
            }
        });
    }
    remove(id) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else if (typeof this._data[id] === 'undefined') {
                this._lastError = constants_dfdb_1.Errors.DocNotFound;
                reject(this._lastError);
            }
            else {
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
    search(conditions) {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        return new es6_promise_1.Promise((resolve, reject) => {
            let findings = [];
            let foundIds = [];
            let indexedConditions = {};
            let unindexedConditions = {};
            const unindexedSearch = () => {
                const unindexedConditionsKeys = Object.keys(unindexedConditions);
                unindexedConditionsKeys.forEach((key) => unindexedConditions[key] = unindexedConditions[key].toLowerCase());
                resolve(findings.filter((datum) => {
                    let accept = true;
                    unindexedConditionsKeys.forEach((key) => {
                        if (typeof datum[key] === 'undefined') {
                            accept = false;
                        }
                        else {
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
                }
                else {
                    indexedConditions[key] = conditions[key];
                }
            });
            if (Object.keys(indexedConditions).length > 0) {
                this.findIds(indexedConditions)
                    .then((ids) => {
                    findings = this.idsToData(ids);
                    unindexedSearch();
                })
                    .catch(reject);
            }
            else {
                findings = this.idsToData(Object.keys(this._data));
                unindexedSearch();
            }
        });
    }
    searchOne(conditions) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this.search(conditions)
                .then((findings) => {
                if (findings.length > 0) {
                    resolve(findings[0]);
                }
                else {
                    resolve(null);
                }
            })
                .catch(reject);
        });
    }
    truncate() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._data = {};
                this.truncateIndexes(null)
                    .then(() => {
                    this.save()
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    update(id, doc) {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof doc !== 'object' || Array.isArray(doc)) {
                this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
                reject(this._lastError);
            }
            else if (typeof this._data[id] === 'undefined') {
                this._lastError = constants_dfdb_1.Errors.DocNotFound;
                reject(this._lastError);
            }
            else if (!this._connected) {
                this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
                reject(this._lastError);
            }
            else {
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
    addDocToIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].addDocument(params.doc)
                .then(resolve)
                .catch(reject);
        });
    }
    addDocToIndexes(doc) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { doc, indexName },
                    function: (params) => this.addDocToIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    closeIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].close()
                .then(() => {
                delete this._indexes[params.indexName];
                resolve();
            })
                .catch(reject);
        });
    }
    closeIndexes(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params) => this.closeIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    dropIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            delete this._manifest.indexes[params.indexName];
            this._indexes[params.indexName].drop()
                .then(() => {
                delete this._indexes[params.indexName];
                resolve();
            })
                .catch(reject);
        });
    }
    dropIndexes(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params) => this.dropIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    dropManifest(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._connection.removeFile(this._manifestPath)
                .then((results) => {
                this._manifest = {};
                resolve();
            })
                .catch(reject);
        });
    }
    dropResource(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._connection.removeFile(this._resourcePath)
                .then((results) => {
                this._data = {};
                resolve();
            })
                .catch(reject);
        });
    }
    dropSequence(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._sequence.drop()
                .then(() => {
                this._sequence = null;
                resolve();
            })
                .catch(reject);
        });
    }
    findIds(conditions) {
        if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        return new es6_promise_1.Promise((resolve, reject) => {
            const indexesToUse = [];
            Object.keys(conditions).forEach(key => {
                if (typeof this._indexes[key] === 'undefined') {
                    this._lastError = `${constants_dfdb_1.Errors.NotIndexedField}. Field: '${key}'.`;
                }
                else {
                    indexesToUse.push(key);
                }
            });
            if (!this.error()) {
                let ids = Object.keys(this._data);
                const run = () => {
                    const idx = indexesToUse.shift();
                    if (idx) {
                        this._indexes[idx].find(`${conditions[idx]}`)
                            .then((foundIds) => {
                            ids = ids.filter(i => foundIds.indexOf(i) > -1);
                            run();
                        })
                            .catch(reject);
                    }
                    else {
                        resolve(ids);
                    }
                };
                run();
            }
            else {
                resolve([]);
            }
        });
    }
    idsToData(ids) {
        return ids.map(id => this._data[id]);
    }
    loadIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof this._indexes[params.name] === 'undefined') {
                this._indexes[params.name] = new index_dfdb_1.Index(this, params.field, this._connection);
                this._indexes[params.name].connect()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    loadIndexes(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._manifest.indexes).forEach(key => {
                steps.push({
                    params: this._manifest.indexes[key],
                    function: (params) => this.loadIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    loadManifest(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._connection.loadFile(this._manifestPath)
                .then((results) => {
                if (results.error) {
                    this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
                    this._manifest = JSON.parse(results.data);
                    resolve();
                }
            })
                .catch(reject);
        });
    }
    loadResource(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._data = {};
            this._connection.loadFile(this._resourcePath)
                .then((results) => {
                if (results.error) {
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
                else if (results.data !== null) {
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
    loadSequence(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._sequence = new sequence_dfdb_1.Sequence(this, constants_dfdb_1.BasicConstants.DefaultSequence, this._connection);
            this._sequence.connect()
                .then(resolve)
                .catch(reject);
        });
    }
    processStepsSequence(steps) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (steps.length > 0) {
                const step = steps.shift();
                step.function(step.params)
                    .then(() => this.processStepsSequence(steps).then(resolve).catch(reject))
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    removeDocFromIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].removeDocument(params.id)
                .then(resolve)
                .catch(reject);
        });
    }
    removeDocFromIndexes(id) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { id, indexName },
                    function: (params) => this.removeDocFromIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    resetError() {
        this._lastError = null;
    }
    truncateIndex(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._indexes[params.indexName].skipSave();
            this._indexes[params.indexName].truncate()
                .then(resolve)
                .catch(reject);
        });
    }
    truncateIndexes(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params) => this.truncateIndex(params)
                });
            });
            this.processStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    save() {
        return new es6_promise_1.Promise((resolve, reject) => {
            let data = [];
            Object.keys(this._data).forEach(id => {
                data.push(`${id}|${JSON.stringify(this._data[id])}`);
            });
            this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                .then((mResults) => {
                this._connection.updateFile(this._resourcePath, data.join('\n'))
                    .then((rResults) => {
                    resolve();
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
}
exports.Collection = Collection;
