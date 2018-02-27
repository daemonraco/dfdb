'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '009.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Indexing deep-fields [009]', function () {
    this.timeout(6000);

    const { Collection, Connection, DocsOnFileDB } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection = null;
    let collection = null;

    it('connects and returns a valid connected pointer', done => {
        assert.strictEqual(`${DocsOnFileDB}`, 'DocsOnFileDB[manager]');
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);
                assert.strictEqual(`${db}`, `connection:${dbName}[${dbDirPath}]`);

                assert.isFalse(db.error());

                connection = db;
            }).then(done, done);
    });

    it('retrieves a new collection and returns a valid one', done => {
        assert.typeOf(connection.collection, 'function');

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, Collection);
                assert.isFalse(col.error());

                assert.strictEqual(`${col}`, `collection:${collectionName}`);

                collection = col;
            }).then(done, done);
    });

    it('inserts example documents', done => {
        assert.typeOf(collection.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.003.json')));
        const run = () => {
            const doc = docs.shift();

            if (doc) {
                collection.insert(doc)
                    .then(insertedDoc => {
                        assert.isFalse(collection.error());
                        assert.isNull(collection.lastError());

                        assert.typeOf(insertedDoc, 'object');

                        run();
                    })
                    .catch(err => {
                        assert.isTrue(false, `a rejection was not expected at this point.`);
                        done();
                    })
            } else {
                done();
            }
        };
        run();
    });

    it(`adds an index for field 'address.street' which is a list field`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('address.street')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            }).then(done, done);
    });

    it(`checking index for field 'address.street'`, () => {
        assert.typeOf(collection.hasIndex, 'function');
        assert.typeOf(collection.indexes, 'function');

        const indexName = 'address.street';
        const indexes = collection.indexes();

        assert.isTrue(collection.hasIndex(indexName));

        assert.isObject(indexes);
        assert.property(indexes, indexName);
        assert.typeOf(indexes[indexName], 'object');

        assert.property(indexes[indexName], 'name');
        assert.property(indexes[indexName], 'field');

        assert.typeOf(indexes[indexName].name, 'string');
        assert.typeOf(indexes[indexName].field, 'string');

        assert.strictEqual(indexes[indexName].name, indexName);
        assert.strictEqual(indexes[indexName].field, indexName);
    });

    it(`searches for an indexed string on field 'address.street'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.find({
            'address.street': 'Lawrence Street'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 2);

            assert.strictEqual(docs[0]._id, '13');
            assert.strictEqual(docs[0].name, 'Wilma Cortez');
            assert.strictEqual(docs[0].company, 'ZILLACOM');
            assert.strictEqual(docs[0].email, 'wilmacortez@zillacom.com');
            assert.isObject(docs[0].address);
            assert.strictEqual(docs[0].address.street, 'Lawrence Street');
            assert.strictEqual(docs[0].address.number, 679);

            assert.strictEqual(docs[1]._id, '28');
            assert.strictEqual(docs[1].name, 'Christina Ewing');
            assert.strictEqual(docs[1].company, 'MICROLUXE');
            assert.strictEqual(docs[1].email, 'christinaewing@microluxe.com');
            assert.isObject(docs[1].address);
            assert.strictEqual(docs[1].address.street, 'Lawrence Street');
            assert.strictEqual(docs[1].address.number, 913);
        }).then(done, done);
    });

    it(`searches for indexed and unindexed deep-fields`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            'address.street': 'Lawrence Street',
            'address.number': 913
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 1);

            assert.strictEqual(docs[0]._id, '28');
            assert.strictEqual(docs[0].name, 'Christina Ewing');
            assert.strictEqual(docs[0].company, 'MICROLUXE');
            assert.strictEqual(docs[0].email, 'christinaewing@microluxe.com');
            assert.isObject(docs[0].address);
            assert.strictEqual(docs[0].address.street, 'Lawrence Street');
            assert.strictEqual(docs[0].address.number, 913);
        }).then(done, done);
    });

    it('closes the connection', done => {
        assert.typeOf(connection.close, 'function');

        connection.close()
            .then(() => {
                assert.isFalse(connection.connected());
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());
            }).then(done, done);
    });
});
