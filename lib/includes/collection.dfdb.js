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
                this.loadIndexes(null, () => {
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
                });
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
                steps.push({ params: {}, function: (params, next) => this.loadManifest(params, next) });
                steps.push({ params: {}, function: (params, next) => this.loadResource(params, next) });
                steps.push({ params: {}, function: (params, next) => this.loadSequence(params, next) });
                steps.push({ params: {}, function: (params, next) => this.loadIndexes(params, next) });
                this.processStepsSequence(steps, () => {
                    this._connected = true;
                    resolve();
                });
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
                    function: (params, next) => {
                        this._sequence.skipSave();
                        this._sequence.close()
                            .then(() => {
                            this._sequence = null;
                            next();
                        })
                            .catch((err) => { });
                    }
                });
                steps.push({ params: {}, function: (params, next) => this.closeIndexes(params, next) });
                this.processStepsSequence(steps, () => {
                    this._connection.forgetCollection(this._name);
                    this.save()
                        .then(() => {
                        this._data = {};
                        this._connected = false;
                        resolve();
                    })
                        .catch(reject);
                });
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
                steps.push({ params: {}, function: (params, next) => this.dropIndexes(params, next) });
                steps.push({ params: {}, function: (params, next) => this.dropSequence(params, next) });
                steps.push({ params: {}, function: (params, next) => this.dropResource(params, next) });
                steps.push({ params: {}, function: (params, next) => this.dropManifest(params, next) });
                this.processStepsSequence(steps, () => {
                    this._connected = false;
                    resolve();
                });
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
    addDocToIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].addDocument(params.doc)
            .then(() => next())
            .catch((err) => next());
    }
    addDocToIndexes(doc) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { doc, indexName },
                    function: (params, next) => this.addDocToIndex(params, next)
                });
            });
            this.processStepsSequence(steps, resolve);
        });
    }
    closeIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].close()
            .then(() => {
            delete this._indexes[params.indexName];
            next();
        })
            .catch((err) => next());
    }
    closeIndexes(params, next) {
        let steps = [];
        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { indexName },
                function: (params, next) => this.closeIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    dropIndex(params, next) {
        delete this._manifest.indexes[params.indexName];
        this._indexes[params.indexName].drop()
            .then(() => {
            delete this._indexes[params.indexName];
            next();
        })
            .catch((err) => next());
    }
    dropIndexes(params, next) {
        let steps = [];
        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { indexName },
                function: (params, next) => this.dropIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    dropManifest(params, next) {
        this._connection.removeFile(this._manifestPath)
            .then((results) => {
            this._manifest = {};
            next();
        })
            .catch((err) => next());
    }
    dropResource(params, next) {
        this._connection.removeFile(this._resourcePath)
            .then((results) => {
            this._data = {};
            next();
        })
            .catch((err) => next());
    }
    dropSequence(params, next) {
        this._sequence.drop()
            .then(() => {
            this._sequence = null;
            next();
        })
            .catch((err) => next());
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
    loadIndex(params, next) {
        if (typeof this._indexes[params.name] === 'undefined') {
            this._indexes[params.name] = new index_dfdb_1.Index(this, params.field, this._connection);
            this._indexes[params.name].connect()
                .then(() => next())
                .catch((err) => next());
        }
        else {
            next();
        }
    }
    loadIndexes(params, next) {
        let steps = [];
        Object.keys(this._manifest.indexes).forEach(key => {
            steps.push({
                params: this._manifest.indexes[key],
                function: (params, next) => this.loadIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    loadManifest(params, next) {
        this._connection.loadFile(this._manifestPath)
            .then((results) => {
            if (results.error) {
                this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest))
                    .then(() => next())
                    .catch((err) => next());
            }
            else if (results.data !== null) {
                this._manifest = JSON.parse(results.data);
                next();
            }
        })
            .catch((err) => next());
    }
    loadResource(params, next) {
        this._data = {};
        this._connection.loadFile(this._resourcePath)
            .then((results) => {
            if (results.error) {
                this.save()
                    .then(() => next())
                    .catch((err) => next());
            }
            else if (results.data !== null) {
                results.data.split('\n')
                    .filter(line => line != '')
                    .forEach(line => {
                    const pieces = line.split('|');
                    const id = pieces.shift();
                    this._data[id] = JSON.parse(pieces.join('|'));
                });
                next();
            }
        })
            .catch((err) => next());
    }
    loadSequence(params, next) {
        this._sequence = new sequence_dfdb_1.Sequence(this, constants_dfdb_1.BasicConstants.DefaultSequence, this._connection);
        this._sequence.connect()
            .then(() => next())
            .catch((err) => next());
    }
    processStepsSequence(steps, next) {
        if (steps.length > 0) {
            const step = steps.shift();
            step.function(step.params, () => this.processStepsSequence(steps, next));
        }
        else {
            next();
        }
    }
    removeDocFromIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].removeDocument(params.id)
            .then(() => next())
            .catch((err) => next());
    }
    removeDocFromIndexes(id) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { id, indexName },
                    function: (params, next) => this.removeDocFromIndex(params, next)
                });
            });
            this.processStepsSequence(steps, resolve);
        });
    }
    resetError() {
        this._lastError = null;
    }
    truncateIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].truncate()
            .then(() => next())
            .catch((err) => next());
    }
    truncateIndexes(params) {
        return new es6_promise_1.Promise((resolve, reject) => {
            let steps = [];
            Object.keys(this._indexes).forEach(indexName => {
                steps.push({
                    params: { indexName },
                    function: (params, next) => this.truncateIndex(params, next)
                });
            });
            this.processStepsSequence(steps, resolve);
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
