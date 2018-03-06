'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '005.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Heavy search [005]', function () {
    this.timeout(12000);

    const { Collection, Connection, DocsOnFileDB } = require('..');
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

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, Collection);
                assert.isFalse(col.error());

                collection = col;
            })
            .then(done, done);
    });

    it('inserts example documents', done => {
        assert.typeOf(collection.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.001.json')));
        docs = docs.concat(JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.002.json'))));
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

    it(`adds an index for field 'company'`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('company')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            })
            .then(done, done);
    });

    it(`searches for an indexed field and another that is not`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            email: 'akishapuckett',
            company: 'ISOPLEX'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 1);
            assert.strictEqual(docs[0]._id, '7');
            assert.strictEqual(docs[0].name, 'Lakisha Puckett');
            assert.strictEqual(docs[0].company, 'ISOPLEX');
            assert.strictEqual(docs[0].email, 'lakishapuckett@isoplex.com');
        }).then(done, done);
    });

    it(`searches for all unindexed fields`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            email: 'akishapuckett',
            name: 'Lakisha Puckett'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 1);
            assert.strictEqual(docs[0]._id, '7');
            assert.strictEqual(docs[0].name, 'Lakisha Puckett');
            assert.strictEqual(docs[0].company, 'ISOPLEX');
            assert.strictEqual(docs[0].email, 'lakishapuckett@isoplex.com');
        }).then(done, done);
    });

    it(`searches for an unindexed field that appears only in one document`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            extradata: 'somedata'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 1);
            assert.strictEqual(docs[0]._id, '7');
            assert.strictEqual(docs[0].name, 'Lakisha Puckett');
            assert.strictEqual(docs[0].company, 'ISOPLEX');
            assert.strictEqual(docs[0].email, 'lakishapuckett@isoplex.com');
        }).then(done, done);
    });

    it(`searches for just one document based on an unindexed`, done => {
        assert.typeOf(collection.search, 'function');

        collection.searchOne({
            email: '@isoplex.com'
        }).then(doc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(doc._id, '7');
            assert.strictEqual(doc.name, 'Lakisha Puckett');
            assert.strictEqual(doc.company, 'ISOPLEX');
            assert.strictEqual(doc.email, 'lakishapuckett@isoplex.com');
        }).then(done, done);
    });

    it(`counts documents without conditions`, done => {
        assert.typeOf(collection.count, 'function');

        collection.count({}).then(result => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(result, 200);
        }).then(done, done);
    });

    it(`counts documents based on a condition`, done => {
        assert.typeOf(collection.count, 'function');

        collection.count({
            extradata: 'somedata'
        }).then(result => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(result, 1);
        }).then(done, done);
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
