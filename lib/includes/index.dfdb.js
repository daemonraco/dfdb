"use strict";
/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const constants_dfdb_1 = require("./constants.dfdb");
class Index {
    //
    // Constructor.
    constructor(collection, field, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._data = {};
        this._field = null;
        this._lastError = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._collection = null;
        this._field = field;
        this._collection = collection;
        this._connection = connection;
        this._resourcePath = `${this._collection.name()}/${this._field}.idx`;
    }
    //
    // Public methods.
    addDocument(doc) {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (typeof doc[this._field] !== 'undefined') {
                if (typeof doc[this._field] === 'object' && doc[this._field] !== null) {
                    this._lastError = constants_dfdb_1.Errors.NotIndexableValue;
                    reject(this._lastError);
                }
                else {
                    const value = `${doc[this._field]}`.toLowerCase();
                    if (typeof this._data[value] === 'undefined') {
                        this._data[value] = [doc._id];
                    }
                    else {
                        if (this._data[value].indexOf(doc._id) < 0) {
                            this._data[value].push(doc._id);
                            this._data[value].sort();
                        }
                    }
                    this.save()
                        .then(resolve)
                        .catch(reject);
                }
            }
            else {
                resolve();
            }
        });
    }
    connect() {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (!this._connected) {
                this._data = {};
                this._connection.loadFile(this._resourcePath)
                    .then((results) => {
                    if (results.error) {
                        this._connected = true;
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                    else if (results.data !== null) {
                        results.data.split('\n')
                            .filter(line => line != '')
                            .forEach(line => {
                            const pieces = line.split('|');
                            const key = pieces.shift();
                            this._data[key] = pieces;
                        });
                        this._connected = true;
                        resolve();
                    }
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
                this.save()
                    .then(() => {
                    this._data = {};
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
    drop() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._connection.removeFile(this._resourcePath)
                    .then(() => {
                    // no need to ask collection to forget this index because it's the
                    // collection's responsibillity to invoke this method and then
                    // forget it.
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
    error() {
        return this._lastError !== null;
    }
    find(value) {
        return new es6_promise_1.Promise((resolve, reject) => {
            value = value.toLowerCase();
            const findings = [];
            this.resetError();
            Object.keys(this._data).forEach((indexValue) => {
                if (indexValue.indexOf(value) > -1) {
                    this._data[indexValue].forEach((id) => {
                        if (findings.indexOf(id) < 0) {
                            findings.push(`${id}`);
                        }
                    });
                }
            });
            findings.sort();
            resolve(findings);
        });
    }
    lastError() {
        return this._lastError;
    }
    removeDocument(id) {
        return new es6_promise_1.Promise((resolve, reject) => {
            Object.keys(this._data).forEach(key => {
                const idx = this._data[key].indexOf(id);
                if (idx > -1) {
                    this._data[key].splice(idx, 1);
                }
                if (this._data[key].length === 0) {
                    delete this._data[key];
                }
            });
            this.save()
                .then(resolve)
                .catch(reject);
        });
    }
    skipSave() {
        this._skipSave = true;
    }
    truncate() {
        this.resetError();
        return new es6_promise_1.Promise((resolve, reject) => {
            if (this._connected) {
                this._data = {};
                this.save()
                    .then(resolve)
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }
    //
    // Protected methods.
    resetError() {
        this._lastError = null;
    }
    save() {
        return new es6_promise_1.Promise((resolve, reject) => {
            let data = [];
            Object.keys(this._data).forEach(key => {
                data.push(`${key}|${this._data[key].join('|')}`);
            });
            this._connection.updateFile(this._resourcePath, data.join('\n'), this._skipSave)
                .then((results) => {
                this._skipSave = false;
                resolve();
            })
                .catch(reject);
        });
    }
}
exports.Index = Index;
