'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '013.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Multiple changes [013]', function () {
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

    it(`searches testing entries`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $gt: 40 } }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 2);

            assert.strictEqual(docs[0]._id, '30');
            assert.strictEqual(docs[0].name, 'Sawyer Weiss');
            assert.strictEqual(docs[0].company, 'DELPHIDE');
            assert.strictEqual(docs[0].email, 'sawyerweiss@delphide.com');

            assert.strictEqual(docs[1]._id, '138');
            assert.strictEqual(docs[1].name, 'Carson Bell');
            assert.strictEqual(docs[1].company, 'QUARMONY');
            assert.strictEqual(docs[1].email, 'carsonbell@quarmony.com');
        }).then(done, done);
    });

    it(`updating company name on multiple entries`, done => {
        assert.typeOf(collection.updateMany, 'function');

        collection.updateMany({ age: { $gt: 40 } }, { company: 'MYCOMPANY' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 2);

                assert.strictEqual(docs[0]._id, '30');
                assert.strictEqual(docs[0].name, 'Sawyer Weiss');
                assert.strictEqual(docs[0].company, 'MYCOMPANY');
                assert.strictEqual(docs[0].email, 'sawyerweiss@delphide.com');

                assert.strictEqual(docs[1]._id, '138');
                assert.strictEqual(docs[1].name, 'Carson Bell');
                assert.strictEqual(docs[1].company, 'MYCOMPANY');
                assert.strictEqual(docs[1].email, 'carsonbell@quarmony.com');
            }).then(done, done);
    });

    it(`searches testing entries after the update`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $gt: 40 } }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 2);

            assert.strictEqual(docs[0]._id, '30');
            assert.strictEqual(docs[0].name, 'Sawyer Weiss');
            assert.strictEqual(docs[0].company, 'MYCOMPANY');
            assert.strictEqual(docs[0].email, 'sawyerweiss@delphide.com');

            assert.strictEqual(docs[1]._id, '138');
            assert.strictEqual(docs[1].name, 'Carson Bell');
            assert.strictEqual(docs[1].company, 'MYCOMPANY');
            assert.strictEqual(docs[1].email, 'carsonbell@quarmony.com');
        }).then(done, done);
    });

    it(`searches non-existent testing entries`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $gt: 140 } }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 0);
        }).then(done, done);
    });

    it(`updating company name on multiple non-existent entries`, done => {
        assert.typeOf(collection.updateMany, 'function');

        collection.updateMany({ age: { $gt: 140 } }, { company: 'MYCOMPANY' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 0);
            }).then(done, done);
    });

    it(`deleting multiple entries`, done => {
        assert.typeOf(collection.removeMany, 'function');

        collection.removeMany({ age: { $gt: 40 } }).then(results => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.isObject(results);
            assert.strictEqual(results.count, 2);
        }).then(done, done);
    });

    it(`searches testing entries`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $gt: 40 } }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 0);
        }).then(done, done);
    });
});
