'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName1 = '012.0.testdb';
const dbName2 = '012.1.testdb';
const dbName3 = '012.2.testdb';
const dbName4 = '012.3.testdb';

const initializer = require('./dataset.005.json');

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: initializers [012]', function () {
    this.timeout(12000);

    const { Collection, Connection, DocsOnFileDB, RejectionCodes } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection1 = null;
    let connection2 = null;
    let connection3 = null;
    let connection4 = null;

    it(`connects and returns a valid connected pointer (db: ${dbName1})`, done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName1, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);

                assert.isFalse(db.error());

                connection1 = db;
            })
            .then(done, done);
    });

    it(`sets a simple initializer that generates an empty collection (db: ${dbName1})`, done => {
        assert.typeOf(connection1.hasInitiaizer, 'function');
        assert.typeOf(connection1.setInitializerFromString, 'function');
        assert.typeOf(connection1.collections, 'function');

        assert.isFalse(connection1.hasInitiaizer());
        assert.isNull(connection1.initiaizer());

        connection1.setInitializerFromString(JSON.stringify(initializer.simple)).then(() => {
            const cols = Object.keys(connection1.collections());

            assert.strictEqual(cols.length, 1);
            assert.strictEqual(cols[0], 'test_collection');

            assert.isTrue(connection1.hasInitiaizer());
            assert.isNotNull(connection1.initiaizer());

            const initializer = connection1.initiaizer().toJSON();

            assert.isArray(initializer.collections);
            assert.strictEqual(initializer.collections.length, 1);
            assert.typeOf(initializer.collections[0], 'object');
            assert.strictEqual(Object.keys(initializer.collections[0]).length, 4);

            assert.strictEqual(initializer.collections[0].name, 'test_collection');
            assert.strictEqual(initializer.collections[0].type, 'simple');
            assert.isArray(initializer.collections[0].indexes);
            assert.strictEqual(initializer.collections[0].indexes.length, 0);
            assert.isArray(initializer.collections[0].data);
            assert.strictEqual(initializer.collections[0].data.length, 0);
        }).then(done, done);
    });

    it(`sets the same initializer again (db: ${dbName1})`, done => {
        assert.typeOf(connection1.hasInitiaizer, 'function');
        assert.typeOf(connection1.setInitializerFromString, 'function');
        assert.typeOf(connection1.collections, 'function');

        assert.isTrue(connection1.hasInitiaizer());

        connection1.setInitializerFromString(JSON.stringify(initializer.simple)).then(() => {
            const cols = Object.keys(connection1.collections());

            assert.isTrue(connection1.hasInitiaizer());

            assert.strictEqual(cols.length, 1);
            assert.strictEqual(cols[0], 'test_collection');
        }).then(done, done);
    });

    it(`closes the connection (db: ${dbName1})`, done => {
        assert.typeOf(connection1.close, 'function');

        connection1.close()
            .then(() => {
                assert.isFalse(connection1.connected());
                assert.isFalse(connection1.error());
                assert.isNull(connection1.lastError());
            })
            .then(done, done);
    });

    // ---------------------------------------------------------------------------

    it(`connects and returns a valid connected pointer (db: ${dbName2})`, done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName2, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);

                assert.isFalse(db.error());

                connection2 = db;
            })
            .then(done, done);
    });

    it(`sets a simple initializer that generates an empty collection (db: ${dbName2})`, done => {
        assert.typeOf(connection2.hasInitiaizer, 'function');
        assert.typeOf(connection2.setInitializerFromJSON, 'function');
        assert.typeOf(connection2.collections, 'function');

        assert.isFalse(connection2.hasInitiaizer());

        connection2.setInitializerFromJSON(initializer.simple).then(() => {
            const cols = Object.keys(connection2.collections());

            assert.isTrue(connection2.hasInitiaizer());

            assert.strictEqual(cols.length, 1);
            assert.strictEqual(cols[0], 'test_collection');
        }).then(done, done);
    });

    it(`closes the connection (db: ${dbName2})`, done => {
        assert.typeOf(connection2.close, 'function');

        connection2.close()
            .then(() => {
                assert.isFalse(connection2.connected());
                assert.isFalse(connection2.error());
                assert.isNull(connection2.lastError());
            })
            .then(done, done);
    });

    // ---------------------------------------------------------------------------

    it(`connects and returns a valid connected pointer (db: ${dbName3})`, done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName3, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);

                assert.isFalse(db.error());

                connection3 = db;
            })
            .then(done, done);
    });

    it(`sets a complex initializer that generates many assets (db: ${dbName3})`, done => {
        assert.typeOf(connection3.hasInitiaizer, 'function');
        assert.typeOf(connection3.setInitializerFromJSON, 'function');
        assert.typeOf(connection3.collections, 'function');

        assert.isFalse(connection3.hasInitiaizer());

        connection3.setInitializerFromJSON(initializer.complex).then(() => {
            const cols = Object.keys(connection3.collections()).sort();

            assert.isTrue(connection3.hasInitiaizer());

            assert.strictEqual(cols.length, 3);
            assert.strictEqual(cols[0], 'collection_with_indexes');
            assert.strictEqual(cols[1], 'simple_collection');
            assert.strictEqual(cols[2], 'with_schema_and_data');
        }).then(done, done);
    });

    it(`checks the only collection with data (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            collection.search({}).then(docs => {
                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0].name, 'John Doe');
                assert.strictEqual(docs[0].age, 34);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].description, 'pending...');
            }).then(done, done);
        });
    });

    it(`reinitializes the database when it had no changes (db: ${dbName3})`, done => {
        assert.typeOf(connection3.hasInitiaizer, 'function');
        assert.typeOf(connection3.reinitialize, 'function');

        assert.isTrue(connection3.hasInitiaizer());

        connection3.reinitialize().then(() => {
            const cols = Object.keys(connection3.collections()).sort();

            assert.isTrue(connection3.hasInitiaizer());

            assert.strictEqual(cols.length, 3);
            assert.strictEqual(cols[0], 'collection_with_indexes');
            assert.strictEqual(cols[1], 'simple_collection');
            assert.strictEqual(cols[2], 'with_schema_and_data');
        }).then(done, done);
    });

    it(`checks the only collection with data (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            assert.typeOf(collection.search, 'function');

            collection.search({}).then(docs => {
                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0].name, 'John Doe');
                assert.strictEqual(docs[0].age, 34);
                assert.strictEqual(docs[0]._id, '1');
                assert.strictEqual(docs[0].description, 'pending...');
            }).then(done, done);
        });
    });

    it(`removes a document (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            assert.typeOf(collection.remove, 'function');

            collection.remove('1').catch(err => {
                assert.isTrue(false, `a rejection was not expected here. Error: ${err}`);
            }).then(done, done);
        });
    });

    it(`checks the only collection with data (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            collection.search({}).then(docs => {
                assert.strictEqual(docs.length, 0);
            }).then(done, done);
        });
    });

    it(`reinitializes the database when it had no changes (db: ${dbName3})`, done => {
        assert.typeOf(connection3.hasInitiaizer, 'function');
        assert.typeOf(connection3.reinitialize, 'function');

        assert.isTrue(connection3.hasInitiaizer());

        connection3.reinitialize().then(() => {
            const cols = Object.keys(connection3.collections()).sort();

            assert.isTrue(connection3.hasInitiaizer());

            assert.strictEqual(cols.length, 3);
            assert.strictEqual(cols[0], 'collection_with_indexes');
            assert.strictEqual(cols[1], 'simple_collection');
            assert.strictEqual(cols[2], 'with_schema_and_data');
        }).then(done, done);
    });

    it(`checks the only collection with data (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            collection.search({}).then(docs => {
                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0].name, 'John Doe');
                assert.strictEqual(docs[0].age, 34);
                assert.strictEqual(docs[0]._id, '2');
                assert.strictEqual(docs[0].description, 'pending...');
            }).then(done, done);
        });
    });

    it(`changes the initializer for something more complex (db: ${dbName3})`, done => {
        assert.typeOf(connection3.hasInitiaizer, 'function');
        assert.typeOf(connection3.setInitializerFromJSON, 'function');
        assert.typeOf(connection3.collections, 'function');

        assert.isTrue(connection3.hasInitiaizer());

        connection3.setInitializerFromJSON(initializer.moreComplex).then(() => {
            const cols = Object.keys(connection3.collections()).sort();

            assert.isTrue(connection3.hasInitiaizer());

            assert.strictEqual(cols.length, 3);
            assert.strictEqual(cols[0], 'collection_with_indexes');
            assert.strictEqual(cols[1], 'simple_collection');
            assert.strictEqual(cols[2], 'with_schema_and_data');
        }).then(done, done);
    });

    it(`checks the only collection with data (db: ${dbName3})`, done => {
        assert.typeOf(connection3.collection, 'function');

        connection3.collection('with_schema_and_data').then(collection => {
            collection.search({}).then(docs => {
                assert.strictEqual(docs.length, 2);

                assert.strictEqual(docs[0].name, 'John Doe');
                assert.strictEqual(docs[0].age, 34);
                assert.strictEqual(docs[0]._id, '2');
                assert.strictEqual(docs[0].description, 'pending...');

                assert.strictEqual(docs[1].name, 'Jane Smith');
                assert.strictEqual(docs[1].age, 27);
                assert.strictEqual(docs[1]._id, '3');
                assert.strictEqual(docs[1].description, 'pending...');
            }).then(done, done);
        });
    });

    it(`closes the connection (db: ${dbName3})`, done => {
        assert.typeOf(connection3.close, 'function');

        connection3.close()
            .then(() => {
                assert.isFalse(connection3.connected());
                assert.isFalse(connection3.error());
                assert.isNull(connection3.lastError());
            })
            .then(done, done);
    });

    // ---------------------------------------------------------------------------

    it(`connects and returns a valid connected pointer (db: ${dbName4})`, done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName4, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, Connection);
                assert.typeOf(db.connected, 'function');
                assert.strictEqual(db.connected(), true);

                assert.isFalse(db.error());

                connection4 = db;
            })
            .then(done, done);
    });

    it(`sets an invalid initializer (db: ${dbName4})`, done => {
        assert.typeOf(connection4.hasInitiaizer, 'function');
        assert.typeOf(connection4.setInitializerFromJSON, 'function');
        assert.typeOf(connection4.collections, 'function');

        assert.isFalse(connection4.hasInitiaizer());

        connection4.setInitializerFromJSON(initializer.wrong).then(() => {
            assert.isTrue(false, `a success was not expected at this point.`)
        }).catch(err => {
            const expectedErrorMessage = RejectionCodes.Message(RejectionCodes.InvalidJSON, true);

            assert.isFalse(connection4.hasInitiaizer());

            assert.isNotNull(connection4.lastError());
            assert.strictEqual(`${err}`.indexOf(expectedErrorMessage), 0);
            assert.strictEqual(connection4.lastError().indexOf(expectedErrorMessage), 0);
        }).then(done, done);
    });

    it(`closes the connection (db: ${dbName4})`, done => {
        assert.typeOf(connection4.close, 'function');

        connection4.close()
            .then(() => {
                assert.isFalse(connection4.connected());
                assert.isFalse(connection4.error());
                assert.isNull(connection4.lastError());
            })
            .then(done, done);
    });
});
