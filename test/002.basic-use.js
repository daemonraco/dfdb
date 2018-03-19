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
describe('dfdb: Basic use [002]', function () {
    this.timeout(6000);

    const { Collection, CollectionTypes, Connection, DocsOnFileDB } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection = null;
    let collection = null;

    it('connects and returns a valid connected pointer', done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);

                assert.isFalse(db.error());

                connection = db;
            })
            .then(done, done);
    });

    it('retrieves a new collection and returns a valid one', done => {
        assert.typeOf(connection.collection, 'function');
        assert.typeOf(connection.hasCollection, 'function');
        assert.typeOf(connection.collections, 'function');

        const hasCollection = connection.hasCollection(collectionName);
        assert.isBoolean(hasCollection);
        assert.isFalse(hasCollection);

        const collections = connection.collections();
        assert.isObject(collections);
        assert.strictEqual(Object.keys(collections).length, 0);

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, Collection);
                assert.isFalse(col.error());

                const hasCollection = connection.hasCollection(collectionName);
                assert.isBoolean(hasCollection);
                assert.isTrue(hasCollection);

                const collections = connection.collections();
                assert.isObject(collections);
                assert.strictEqual(Object.keys(collections).length, 1);

                assert.property(collections, collectionName);
                assert.isObject(collections[collectionName]);
                assert.property(collections[collectionName], 'name');
                assert.property(collections[collectionName], 'type');

                assert.isString(collections[collectionName].name);
                assert.isString(collections[collectionName].type);

                assert.strictEqual(collections[collectionName].name, collectionName);
                assert.strictEqual(collections[collectionName].type, CollectionTypes.Simple);

                collection = col;
            })
            .then(done, done);
    });

    it('inserts a new document', done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({ hello: 'world!', extra: 10 })
            .then(insertedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(insertedDoc, 'object');

                assert.property(insertedDoc, '_id');
                assert.property(insertedDoc, '_created');
                assert.property(insertedDoc, '_updated');
                assert.property(insertedDoc, 'hello');
                assert.property(insertedDoc, 'extra');

                assert.isString(insertedDoc._id);
                assert.instanceOf(insertedDoc._created, Date);
                assert.instanceOf(insertedDoc._updated, Date);

                assert.strictEqual(insertedDoc._id, '1');
                assert.strictEqual(insertedDoc.hello, 'world!');
                assert.strictEqual(insertedDoc.extra, 10);
            })
            .then(done, done);
    });

    it('updates the new document', done => {
        assert.typeOf(collection.update, 'function');

        collection.update(1, { hola: 'mundo!', extra: 10 })
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(updatedDoc, 'object');

                assert.property(updatedDoc, '_id');
                assert.property(updatedDoc, '_created');
                assert.property(updatedDoc, '_updated');
                assert.notProperty(updatedDoc, 'hello');
                assert.property(updatedDoc, 'hola');
                assert.property(updatedDoc, 'extra');

                assert.isString(updatedDoc._id);
                assert.instanceOf(updatedDoc._created, Date);
                assert.instanceOf(updatedDoc._updated, Date);

                assert.strictEqual(updatedDoc._id, '1');
                assert.strictEqual(updatedDoc.hola, 'mundo!');
                assert.strictEqual(updatedDoc.extra, 10);
            })
            .then(done, done);
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
                assert.strictEqual(collection.lastError(), '[E-0002] The requested document does not exist');
            })
            .then(done, done);
    });

    it('partially updates a document', done => {
        assert.typeOf(collection.partialUpdate, 'function');

        collection.partialUpdate(1, { extra: 20, another: 30 })
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(updatedDoc, 'object');

                assert.property(updatedDoc, '_id');
                assert.property(updatedDoc, '_created');
                assert.property(updatedDoc, '_updated');
                assert.notProperty(updatedDoc, 'hello');
                assert.property(updatedDoc, 'hola');
                assert.property(updatedDoc, 'extra');
                assert.property(updatedDoc, 'another');

                assert.isString(updatedDoc._id);
                assert.instanceOf(updatedDoc._created, Date);
                assert.instanceOf(updatedDoc._updated, Date);

                assert.strictEqual(updatedDoc._id, '1');
                assert.strictEqual(updatedDoc.hola, 'mundo!');
                assert.strictEqual(updatedDoc.extra, 20);
                assert.strictEqual(updatedDoc.another, 30);
            })
            .then(done, done);
    });

    it(`updates a document trying to change its ID`, done => {
        assert.typeOf(collection.update, 'function');

        collection.update(1, { _id: 10, hola: 'mundo!', extra: 10 })
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(updatedDoc, 'object');

                assert.property(updatedDoc, '_id');
                assert.property(updatedDoc, '_created');
                assert.property(updatedDoc, '_updated');
                assert.notProperty(updatedDoc, 'hello');
                assert.property(updatedDoc, 'hola');
                assert.property(updatedDoc, 'extra');

                assert.isString(updatedDoc._id);
                assert.instanceOf(updatedDoc._created, Date);
                assert.instanceOf(updatedDoc._updated, Date);

                assert.strictEqual(updatedDoc._id, '1');
                assert.strictEqual(updatedDoc.hola, 'mundo!');
                assert.strictEqual(updatedDoc.extra, 10);
            })
            .then(done, done);
    });

    it('partially updates a document trying to change its ID', done => {
        assert.typeOf(collection.partialUpdate, 'function');

        collection.partialUpdate(1, { _id: 10, extra: 20, another: 30 })
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(updatedDoc, 'object');

                assert.property(updatedDoc, '_id');
                assert.property(updatedDoc, '_created');
                assert.property(updatedDoc, '_updated');
                assert.notProperty(updatedDoc, 'hello');
                assert.property(updatedDoc, 'hola');
                assert.property(updatedDoc, 'extra');
                assert.property(updatedDoc, 'another');

                assert.isString(updatedDoc._id);
                assert.instanceOf(updatedDoc._created, Date);
                assert.instanceOf(updatedDoc._updated, Date);

                assert.strictEqual(updatedDoc._id, '1');
                assert.strictEqual(updatedDoc.hola, 'mundo!');
                assert.strictEqual(updatedDoc.extra, 20);
                assert.strictEqual(updatedDoc.another, 30);
            })
            .then(done, done);
    });

    it('closes the connection', done => {
        assert.typeOf(connection.close, 'function');

        connection.close()
            .then(() => {
                assert.isFalse(connection.connected());
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());
            })
            .then(done, done);
    });
});
