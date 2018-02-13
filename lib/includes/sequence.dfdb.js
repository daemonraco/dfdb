"use strict";
/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
/**
 * This class represents sequence of ids associated to a collection.
 *
 * @class Sequence
 */
class Sequence {
    //
    // Constructor.
    constructor(collection, name, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._lastError = null;
        this._name = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._collection = null;
        this._value = 0;
        this._name = name;
        this._collection = collection;
        this._connection = connection;
        this._resourcePath = `${this._collection.name()}/${this._name}.seq`;
    }
    //
    // Public methods.
    connect() {
        return new es6_promise_1.Promise((resolve, reject) => {
            if (!this._connected) {
                this._connection.loadFile(this._resourcePath)
                    .then((results) => {
                    if (results.error) {
                        this._connected = true;
                        this._value = 0;
                        this._skipSave = false;
                        this.save()
                            .then(resolve)
                            .catch(reject);
                    }
                    else if (results.data !== null) {
                        this._value = parseInt(results.data);
                        this._connected = true;
                        resolve();
                    }
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
                this.save()
                    .then(() => {
                    this._value = 0;
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
                    .then((results) => {
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
    lastError() {
        return this._lastError;
    }
    next() {
        this._value++;
        this.save()
            .then(() => { })
            .catch(() => { });
        return this._value;
    }
    skipSave() {
        this._skipSave = true;
    }
    //
    // Protected methods.
    resetError() {
        this._lastError = null;
    }
    save() {
        return new es6_promise_1.Promise((resolve, reject) => {
            this._connection.updateFile(this._resourcePath, `${this._value}`, this._skipSave)
                .then((results) => {
                this._skipSave = false;
                resolve();
            })
                .catch(reject);
        });
    }
}
exports.Sequence = Sequence;
