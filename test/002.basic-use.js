'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '002.testdb';
const tableName = 'test_table';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Basic use', function () {
    //this.timeout(15000);
    //
    const { DocsOnFileDB, types } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection = null;
    let table = null;

    it('connects and returns a valid connected pointer', done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null, db => {
            assert.instanceOf(db, types.Connection);
            assert.typeOf(db.connected, 'function');
            assert.equal(db.connected(), true);

            assert.isFalse(db.error());

            connection = db;
            done();
        });
    });

    it('retrieves a new table and returns a valid one', done => {
        assert.typeOf(connection.table, 'function');

        connection.table(tableName, tab => {
            assert.instanceOf(tab, types.Table);
            assert.isFalse(tab.error());

            table = tab;
            done();
        });
    });

    it('inserts a new document', done => {
        assert.typeOf(table.insert, 'function');

        table.insert({ hello: 'world!' }, insertedDoc => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.typeOf(insertedDoc, 'object');

            assert.property(insertedDoc, '_id');
            assert.property(insertedDoc, '_created');
            assert.property(insertedDoc, '_updated');
            assert.property(insertedDoc, 'hello');

            assert.isNumber(insertedDoc._id);
            assert.instanceOf(insertedDoc._created, Date);
            assert.instanceOf(insertedDoc._updated, Date);
            assert.isString(insertedDoc.hello);

            assert.equal(insertedDoc._id, 1);
            assert.equal(insertedDoc.hello, 'world!');

            done();
        });
    });

    it('updates a new document', done => {
        assert.typeOf(table.update, 'function');

        table.update(1, { hola: 'mundo!' }, updatedDoc => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.typeOf(updatedDoc, 'object');

            assert.property(updatedDoc, '_id');
            assert.property(updatedDoc, '_created');
            assert.property(updatedDoc, '_updated');
            assert.notProperty(updatedDoc, 'hello');
            assert.property(updatedDoc, 'hola');

            assert.isNumber(updatedDoc._id);
            assert.instanceOf(updatedDoc._created, Date);
            assert.instanceOf(updatedDoc._updated, Date);
            assert.isString(updatedDoc.hola);

            assert.equal(updatedDoc._id, 1);
            assert.equal(updatedDoc.hola, 'mundo!');

            done();
        });
    });

    it('updates an unknown document', done => {
        assert.typeOf(table.update, 'function');

        table.update(2, { konnichiha: 'sekai!' }, updatedDoc => {
            assert.isTrue(table.error());
            assert.isNotNull(table.lastError());
            assert.isString(table.lastError());
            assert.equal(table.lastError(), '[E-0002] The requested document does not exist');

            assert.isNull(updatedDoc);

            done();
        });
    });
});
