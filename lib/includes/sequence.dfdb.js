"use strict";
/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
    connect(done = null) {
        if (done === null) {
            done = () => { };
        }
        if (!this._connected) {
            this._connection.loadFile(this._resourcePath, (error, data) => {
                if (error) {
                    this._connected = true;
                    this._value = 0;
                    this._skipSave = false;
                    this.save(done);
                }
                else if (data !== null) {
                    this._value = parseInt(data);
                    this._connected = true;
                    done();
                }
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
            this.save(() => {
                this._value = 0;
                this._connected = false;
                done();
            });
        }
        else {
            done();
        }
    }
    drop(done = null) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._connected) {
            this._connection.removeFile(this._resourcePath, () => {
                // no need to ask collection to forget this index because it's the
                // collection's responsibillity to invoke this method and then
                // forget it.
                this._connected = false;
                done();
            });
        }
        else {
            done();
        }
    }
    error() {
        return this._lastError !== null;
    }
    lastError() {
        return this._lastError;
    }
    next() {
        this._value++;
        this.save(() => { });
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
    save(done = null) {
        this._connection.updateFile(this._resourcePath, `${this._value}`, () => {
            this._skipSave = false;
            done();
        }, this._skipSave);
    }
}
exports.Sequence = Sequence;
