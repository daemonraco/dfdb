"use strict";
/**
 * @file sequence.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Sequence {
    //
    // Constructor.
    constructor(table, name, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._lastError = null;
        this._loaded = false;
        this._name = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._table = null;
        this._value = 0;
        this._name = name;
        this._table = table;
        this._connection = connection;
        this._resourcePath = `${this._table.name()}/${this._name}.seq`;
    }
    //
    // Public methods.
    connect(done = null) {
        if (done === null) {
            done = () => { };
        }
        if (!this._loaded) {
            this._loaded = true;
            const file = this._connection.filePointer().file(this._resourcePath);
            if (file === null) {
                this._connected = true;
                this._value = 0;
                this._skipSave = false;
                this.save(done);
            }
            else {
                file.async('text').then((x) => {
                    this._value = parseInt(x);
                    this._connected = true;
                    done();
                });
            }
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
    save(done = null) {
        this._connection.filePointer().file(this._resourcePath, `${this._value}`);
        if (!this._skipSave) {
            this._connection.save(done);
        }
        else {
            done();
        }
        this._skipSave = false;
    }
}
exports.Sequence = Sequence;
