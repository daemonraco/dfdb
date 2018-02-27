'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '011.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Search primitive values [011]', function () {
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

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.004.json')));
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

    it(`searches for numbers greater than 20`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ price: { $gt: 20 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '4');
                assert.strictEqual(docs[0].price, 100.1);
            }).then(done, done);
    });

    it(`searches for numbers greater than or equal to 20`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ price: { $ge: 20 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 2);
                assert.strictEqual(docs[0]._id, '3');
                assert.strictEqual(docs[0].price, 20);
                assert.strictEqual(docs[1]._id, '4');
                assert.strictEqual(docs[1].price, 100.1);
            }).then(done, done);
    });

    it(`searches for numbers lower than 20`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ price: { $lt: 20 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 3);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].price, 1);
                assert.strictEqual(docs[1]._id, '2');
                assert.strictEqual(docs[1].price, 10);
                assert.strictEqual(docs[2]._id, '5');
                assert.strictEqual(docs[2].price, 10.1);
            }).then(done, done);
    });

    it(`searches for numbers lower than or equal to 20`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ price: { $le: 20 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 4);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].price, 1);
                assert.strictEqual(docs[1]._id, '2');
                assert.strictEqual(docs[1].price, 10);
                assert.strictEqual(docs[2]._id, '3');
                assert.strictEqual(docs[2].price, 20);
                assert.strictEqual(docs[3]._id, '5');
                assert.strictEqual(docs[3].price, 10.1);
            }).then(done, done);
    });

    it(`searches for numbers greater than '20'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ priceStr: { $gt: '20' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 0);
            }).then(done, done);
    });

    it(`searches for numbers greater than or equal to '20'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ priceStr: { $ge: '20' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '3');
                assert.strictEqual(docs[0].priceStr, "20");
            }).then(done, done);
    });

    it(`searches for numbers lower than '20'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ priceStr: { $lt: '20' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 4);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].priceStr, "1");
                assert.strictEqual(docs[1]._id, '2');
                assert.strictEqual(docs[1].priceStr, "10");
                assert.strictEqual(docs[2]._id, '4');
                assert.strictEqual(docs[2].priceStr, "100.1");
                assert.strictEqual(docs[3]._id, '5');
                assert.strictEqual(docs[3].priceStr, "10.1");
            }).then(done, done);
    });

    it(`searches for numbers lower than or equal to '20'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ priceStr: { $le: '20' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 5);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].priceStr, "1");
                assert.strictEqual(docs[1]._id, '2');
                assert.strictEqual(docs[1].priceStr, "10");
                assert.strictEqual(docs[2]._id, '3');
                assert.strictEqual(docs[2].priceStr, "20");
                assert.strictEqual(docs[3]._id, '4');
                assert.strictEqual(docs[3].priceStr, "100.1");
                assert.strictEqual(docs[4]._id, '5');
                assert.strictEqual(docs[4].priceStr, "10.1");
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
