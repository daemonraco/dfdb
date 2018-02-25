'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '010.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Search keywords [010]', function () {
    this.timeout(12000);

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

                assert.instanceOf(col, types.Collection);
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

    it(`searches for an exact value in an indexed field`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: { $exact: 'ISOPLEX' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 2);
                assert.strictEqual(docs[0]._id, '7');
                assert.strictEqual(docs[1]._id, '147');
                assert.strictEqual(docs[0].company, 'ISOPLEX');
                assert.strictEqual(docs[1].company, 'ISOPLEX');
            }).then(done, done);
    });

    it(`searches for one document with an exact value in an indexed field`, done => {
        assert.typeOf(collection.findOne, 'function');

        collection.findOne({ company: { $exact: 'ISOPLEX' } })
            .then(doc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(doc._id, '7');
                assert.strictEqual(doc.company, 'ISOPLEX');
            }).then(done, done);
    });

    it(`searches for an exact value in an unindexed field`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { $exact: 'davidsonhicks@hawkster.com' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '103');
                assert.strictEqual(docs[0].email, 'davidsonhicks@hawkster.com');
            }).then(done, done);
    });

    it(`searches for one document with an exact value in an unindexed field`, done => {
        assert.typeOf(collection.searchOne, 'function');

        collection.searchOne({ email: { $exact: 'davidsonhicks@hawkster.com' } })
            .then(doc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(doc._id, '103');
                assert.strictEqual(doc.email, 'davidsonhicks@hawkster.com');
            }).then(done, done);
    });

    it(`searches for an unexisting document with an exact value in an unindexed field`, done => {
        assert.typeOf(collection.searchOne, 'function');

        collection.searchOne({ email: { $exact: 'davidsonhicks@hawkster' } })
            .then(doc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
                assert.isNull(doc);
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
