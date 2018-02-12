"use strict";
/**
 * @file collection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
    addFieldIndex(name, done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected && typeof this._indexes[name] === 'undefined') {
            this._manifest.indexes[name] = { name, field: name };
            this.loadIndexes(null, () => {
                let ids = Object.keys(this._data);
                const processIds = () => {
                    const id = ids.shift();
                    if (id) {
                        this._indexes[name].skipSave();
                        this._indexes[name].addDocument(this._data[id], processIds);
                    }
                    else {
                        this.save(done);
                    }
                };
                processIds();
            });
        }
        else if (!this._connected) {
            this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
            done();
        }
        else {
            this._lastError = `${constants_dfdb_1.Errors.DuplicatedIndex}. Index: '${name}'`;
            done();
        }
    }
    connect(done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (!this._connected) {
            let steps = [];
            steps.push({ params: {}, function: (params, next) => this.loadManifest(params, next) });
            steps.push({ params: {}, function: (params, next) => this.loadResource(params, next) });
            steps.push({ params: {}, function: (params, next) => this.loadSequence(params, next) });
            steps.push({ params: {}, function: (params, next) => this.loadIndexes(params, next) });
            this.processStepsSequence(steps, () => {
                this._connected = true;
                done();
            });
        }
        else {
            done();
        }
    }
    close(done = null) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected) {
            let steps = [];
            steps.push({
                params: {},
                function: (params, next) => {
                    this._sequence.skipSave();
                    this._sequence.close(() => {
                        this._sequence = null;
                        next();
                    });
                }
            });
            steps.push({ params: {}, function: (params, next) => this.closeIndexes(params, next) });
            this.processStepsSequence(steps, () => {
                this._connection.forgetCollection(this._name);
                this.save(() => {
                    this._data = {};
                    this._connected = false;
                    done();
                });
            });
        }
        else {
            done();
        }
    }
    drop(done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected) {
            let steps = [];
            steps.push({ params: {}, function: (params, next) => this.dropIndexes(params, next) });
            steps.push({ params: {}, function: (params, next) => this.dropSequence(params, next) });
            steps.push({ params: {}, function: (params, next) => this.dropResource(params, next) });
            steps.push({ params: {}, function: (params, next) => this.dropManifest(params, next) });
            this.processStepsSequence(steps, () => {
                this._connected = false;
                done();
            });
        }
        else {
            done();
        }
    }
    dropFieldIndex(name, done) {
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
        }
        else {
            done();
        }
    }
    error() {
        return this._lastError !== null;
    }
    find(conditions, done) {
        if (typeof conditions === 'function') {
            done = conditions;
            conditions = {};
        }
        else if (typeof conditions !== 'object' || conditions === null) {
            conditions = {};
        }
        if (done === null) {
            done = (findings) => { };
        }
        const findings = [];
        const indexesToUse = [];
        this.resetError();
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
                    this._indexes[idx].find(`${conditions[idx]}`, (foundIds) => {
                        ids = ids.filter(i => foundIds.indexOf(i) > -1);
                        run();
                    });
                }
                else {
                    ids.forEach(id => findings.push(this._data[id]));
                    done(findings);
                }
            };
            run();
        }
        else {
            done(findings);
        }
    }
    findOne(conditions, done) {
        if (typeof done === null) {
            done = (finding) => { };
        }
        this.find(conditions, (findings) => {
            if (findings.length > 0) {
                done(findings[0]);
            }
            else {
                done(null);
            }
        });
    }
    insert(doc, done) {
        if (done === null) {
            done = (inserted) => { };
        }
        this.resetError();
        if (typeof doc !== 'object' || Array.isArray(doc)) {
            this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
            done(null);
        }
        else if (!this._connected) {
            this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
            done(null);
        }
        else {
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
    lastError() {
        return this._lastError;
    }
    name() {
        return this._name;
    }
    rebuildFieldIndex(name, done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected && typeof this._indexes[name] !== 'undefined') {
            this.dropFieldIndex(name, () => this.addFieldIndex(name, done));
        }
        else if (!this._connected) {
            this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
            done();
        }
        else {
            this._lastError = `${constants_dfdb_1.Errors.UnknownIndex}. Index: '${name}'`;
            done();
        }
    }
    remove(id, done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (!this._connected) {
            this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
            done();
        }
        else if (typeof this._data[id] === 'undefined') {
            this._lastError = constants_dfdb_1.Errors.DocNotFound;
            done();
        }
        else {
            delete this._data[id];
            this.removeDocFromIndexes(id, () => {
                this.save(done);
            });
        }
    }
    truncate(done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected) {
            this._data = {};
            this.truncateIndexes(null, () => this.save(done));
        }
        else {
            done();
        }
    }
    update(id, doc, done) {
        if (done === null) {
            done = (inserted) => { };
        }
        this.resetError();
        if (typeof doc !== 'object' || Array.isArray(doc)) {
            this._lastError = constants_dfdb_1.Errors.DocIsNotObject;
            done(null);
        }
        else if (typeof this._data[id] === 'undefined') {
            this._lastError = constants_dfdb_1.Errors.DocNotFound;
            done(null);
        }
        else if (!this._connected) {
            this._lastError = constants_dfdb_1.Errors.CollectionNotConnected;
            done(null);
        }
        else {
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
    addDocToIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].addDocument(params.doc, next);
    }
    addDocToIndexes(doc, next) {
        let steps = [];
        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { doc, indexName },
                function: (params, next) => this.addDocToIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    closeIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].close(() => {
            delete this._indexes[params.indexName];
            next();
        });
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
        this._indexes[params.indexName].drop(() => {
            delete this._indexes[params.indexName];
            next();
        });
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
        this._connection.removeFile(this._manifestPath, (error) => {
            this._manifest = {};
            next();
        });
    }
    dropResource(params, next) {
        this._connection.removeFile(this._resourcePath, (error) => {
            this._data = {};
            next();
        });
    }
    dropSequence(params, next) {
        this._sequence.drop(() => {
            this._sequence = null;
            next();
        });
    }
    loadIndex(params, next) {
        if (typeof this._indexes[params.name] === 'undefined') {
            this._indexes[params.name] = new index_dfdb_1.Index(this, params.field, this._connection);
            this._indexes[params.name].connect(next);
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
        this._connection.loadFile(this._manifestPath, (error, data) => {
            if (error) {
                this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest), () => {
                    next();
                });
            }
            else if (data !== null) {
                this._manifest = JSON.parse(data);
                next();
            }
        });
    }
    loadResource(params, next) {
        this._data = {};
        this._connection.loadFile(this._resourcePath, (error, data) => {
            if (error) {
                this.save(next);
            }
            else if (data !== null) {
                data.split('\n')
                    .filter(line => line != '')
                    .forEach(line => {
                    const pieces = line.split('|');
                    const id = pieces.shift();
                    this._data[id] = JSON.parse(pieces.join('|'));
                });
                next();
            }
        });
    }
    loadSequence(params, next) {
        this._sequence = new sequence_dfdb_1.Sequence(this, constants_dfdb_1.BasicConstants.DefaultSequence, this._connection);
        this._sequence.connect(next);
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
        this._indexes[params.indexName].removeDocument(params.id, next);
    }
    removeDocFromIndexes(id, next) {
        let steps = [];
        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { id, indexName },
                function: (params, next) => this.removeDocFromIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    resetError() {
        this._lastError = null;
    }
    truncateIndex(params, next) {
        this._indexes[params.indexName].skipSave();
        this._indexes[params.indexName].truncate(next);
    }
    truncateIndexes(params, next) {
        let steps = [];
        Object.keys(this._indexes).forEach(indexName => {
            steps.push({
                params: { indexName },
                function: (params, next) => this.truncateIndex(params, next)
            });
        });
        this.processStepsSequence(steps, next);
    }
    save(done = null) {
        let data = [];
        Object.keys(this._data).forEach(id => {
            data.push(`${id}|${JSON.stringify(this._data[id])}`);
        });
        this._connection.updateFile(this._manifestPath, JSON.stringify(this._manifest), () => {
            this._connection.updateFile(this._resourcePath, data.join('\n'), done);
        });
    }
}
exports.Collection = Collection;
