'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '002.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Basic use', function () {
    this.timeout(5000);

    const { DocsOnFileDB, types } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection = null;
    let collection = null;

    it('connects and returns a valid connected pointer', done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, types.Connection);
                assert.typeOf(db.connected, 'function');
                assert.equal(db.connected(), true);

                assert.isFalse(db.error());

                connection = db;
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .finally(done);
    });

    it('retrieves a new collection and returns a valid one', done => {
        assert.typeOf(connection.collection, 'function');

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, types.Collection);
                assert.isFalse(col.error());

                collection = col;
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .finally(done);
    });

    it('inserts a new document', done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({ hello: 'world!' })
            .then(insertedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

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
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
                done();
            });
    });

    it('updates a new document', done => {
        assert.typeOf(collection.update, 'function');

        collection.update(1, { hola: 'mundo!' })
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

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
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .finally(done);
    });

    it('updates an unknown document', done => {
        assert.typeOf(collection.update, 'function');

        collection.update(2, { konnichiha: 'sekai!' })
            .then(updatedDoc => {
                assert.isTrue(false, `a sucess was not expected at this point.`);
            })
            .catch(err => {
                assert.isTrue(collection.error());
                assert.isNotNull(collection.lastError());
                assert.isString(collection.lastError());
                assert.equal(collection.lastError(), '[E-0002] The requested document does not exist');

                assert.isNull(updatedDoc);
            })
            .finally(done);
    });

    it('closes the connection', done => {
        assert.typeOf(connection.close, 'function');

        connection.close()
            .then(() => {
                assert.isFalse(connection.connected());
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .finally(done);
    });
});
