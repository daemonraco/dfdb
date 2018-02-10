"use strict";
/**
 * @file index.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const constants_dfdb_1 = require("./constants.dfdb");
class Index {
    //
    // Constructor.
    constructor(table, field, connection) {
        //
        // Protected properties.
        this._connected = false;
        this._connection = null;
        this._data = {};
        this._loaded = false;
        this._field = null;
        this._lastError = null;
        this._resourcePath = null;
        this._skipSave = false;
        this._table = null;
        this._field = field;
        this._table = table;
        this._connection = connection;
        this._resourcePath = `${this._table.name()}/${this._field}.idx`;
    }
    //
    // Public methods.
    addDocument(doc, done = null) {
        if (done === null) {
            done = () => { };
        }
        if (typeof doc[this._field] !== 'undefined') {
            if (typeof doc[this._field] === 'object' && doc[this._field] !== null) {
                this._lastError = constants_dfdb_1.Errors.NotIndexableValue;
                done();
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
                this.save(done);
            }
        }
        else {
            done();
        }
    }
    connect(done = null) {
        if (done === null) {
            done = () => { };
        }
        if (!this._loaded) {
            this._loaded = true;
            const file = this._connection.filePointer().file(this._resourcePath);
            if (file === null) {
                this.save(done);
            }
            else {
                file.async('text').then((data) => {
                    data.split('\n')
                        .forEach(line => {
                        const pieces = line.split('|', 1);
                        this._data[pieces[0]] = pieces[1].split('|');
                    });
                    this._connected = true;
                    done();
                });
            }
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
        if (this._loaded) {
            this.save(done);
            this._data = {};
            this._loaded = false;
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
        if (this._loaded) {
            this._connection.filePointer().remove(this._resourcePath);
            // no need to ask table to forget this index because it's the table's
            // responsibillity to invoke this method and then forget it.
            this._loaded = false;
        }
    }
    error() {
        return this._lastError !== null;
    }
    find(value, done) {
        if (typeof done === null) {
            done = (ids) => { };
        }
        value = value.toLowerCase();
        const findings = [];
        this.resetError();
        Object.keys(this._data).forEach((indexValue) => {
            if (indexValue.indexOf(value) > -1) {
                this._data[indexValue].forEach((id) => {
                    if (findings.indexOf(id) < 0) {
                        findings.push(id);
                    }
                });
            }
        });
        findings.sort();
        done(findings);
    }
    lastError() {
        return this._lastError;
    }
    removeDocument(id, done = null) {
        if (done === null) {
            done = () => { };
        }
        Object.keys(this._data).forEach(key => {
            const idx = this._data[key].indexOf(id);
            if (idx > -1) {
                this._data[key].splice(idx, 1);
            }
            if (this._data[key].length === 0) {
                delete this._data[key];
            }
        });
        this.save(done);
    }
    skipSave() {
        this._skipSave = true;
    }
    truncate(done) {
        if (done === null) {
            done = () => { };
        }
        this.resetError();
        if (this._loaded) {
            this._data = {};
            this.save(done);
        }
        else {
            done();
        }
    }
    //
    // Protected methods.
    resetError() {
        this._lastError = null;
    }
    save(done = null) {
        let data = [];
        Object.keys(this._data).forEach(key => {
            data.push(`${key}|${this._data[key].join('|')}`);
        });
        this._connection.filePointer().file(this._resourcePath, data.join('\n'));
        if (!this._skipSave) {
            this._connection.save(done);
        }
        else {
            done();
        }
        this._skipSave = false;
    }
}
exports.Index = Index;
