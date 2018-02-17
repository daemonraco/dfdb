'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '004.testdb';
const invalidDbName = '004.testinvaliddb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Administration tools', function () {
    this.timeout(6000);

    const { constants, DocsOnFileDB, types } = require('..');
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
            .then(done, done);
    });

    it('retrieves a new collection and returns a valid one', done => {
        assert.typeOf(connection.collection, 'function');
        assert.typeOf(connection.hasCollection, 'function');

        const hasCollection = connection.hasCollection(collectionName);
        assert.isBoolean(hasCollection);
        assert.isFalse(hasCollection);

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, types.Collection);
                assert.isFalse(col.error());

                const hasCollection = connection.hasCollection(collectionName);
                assert.isBoolean(hasCollection);
                assert.isTrue(hasCollection);

                collection = col;
            })
            .then(done, done);
    });

    it('inserts example documents', done => {
        assert.typeOf(collection.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.001.json')));
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
                    .catch(() => done());
            } else {
                done();
            }
        };
        run();
    });

    it(`adds an index for field 'name'`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('name')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            })
            .then(done, done);
    });

    it(`checks if there's an index called 'name'`, done => {
        assert.typeOf(collection.hasIndex, 'function');

        const check = collection.hasIndex('name');

        assert.isBoolean(check);
        assert.isTrue(check);

        done();
    });

    it(`list indexes`, done => {
        assert.typeOf(collection.indexes, 'function');

        const indexName = 'name';
        const indexes = collection.indexes();

        assert.isObject(indexes);
        assert.property(indexes, indexName);
        assert.typeOf(indexes[indexName], 'object');

        assert.property(indexes[indexName], 'name');
        assert.property(indexes[indexName], 'field');

        assert.typeOf(indexes[indexName].name, 'string');
        assert.typeOf(indexes[indexName].field, 'string');

        assert.equal(indexes[indexName].name, indexName);
        assert.equal(indexes[indexName].field, indexName);

        done();
    });

    it(`searches for an exact value on field 'name' (value 'Lawanda Guzman')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ name: 'Lawanda Guzman' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.equal(docs.length, 1);
                assert.equal(docs[0]._id, 8);
                assert.equal(docs[0].name, 'Lawanda Guzman');
            })
            .then(done, done);
    });

    it(`rebuilds the index for field 'name'`, done => {
        assert.typeOf(collection.rebuildFieldIndex, 'function');

        collection.rebuildFieldIndex('name')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            })
            .then(done, done);
    });

    it(`rebuilds a non existing field index`, done => {
        assert.typeOf(collection.rebuildFieldIndex, 'function');

        collection.rebuildFieldIndex('somefield')
            .then(() => {
                assert.isTrue(false, `a success was not expected at this point.`);
            })
            .catch(err => {
                assert.equal(err.indexOf(constants.Errors.UnknownIndex), 0);

                assert.isTrue(collection.error());
                assert.isNotNull(collection.lastError());
                assert.equal(collection.lastError().indexOf(constants.Errors.UnknownIndex), 0);
            })
            .then(done, done);
    });

    it(`searches for an exact value on field 'name' after rebuild (value 'Lawanda Guzman')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ name: 'Lawanda Guzman' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.equal(docs.length, 1);
                assert.equal(docs[0]._id, 8);
                assert.equal(docs[0].name, 'Lawanda Guzman');
            })
            .then(done, done);
    });

    it(`closes the connection`, done => {
        assert.typeOf(connection.close, 'function');

        connection.close()
            .then(() => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                connection = null;
                collection = null;
            })
            .then(done, done);
    });

    it('reconnects and returns a valid connected pointer', done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null)
            .then(db => {
                assert.instanceOf(db, types.Connection);
                assert.typeOf(db.connected, 'function');
                assert.equal(db.connected(), true);

                assert.isFalse(db.error());

                connection = db;
            })
            .then(done, done);
    });

    it('retrieves the same collection', done => {
        assert.typeOf(connection.collection, 'function');
        assert.typeOf(connection.hasCollection, 'function');

        const hasCollection = connection.hasCollection(collectionName);
        assert.isBoolean(hasCollection);
        assert.isTrue(hasCollection);

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

    it(`searches for the same value again (field 'name', value 'Lawanda Guzman')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ name: 'Lawanda Guzman' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.equal(docs.length, 1);
                assert.equal(docs[0]._id, 8);
                assert.equal(docs[0].name, 'Lawanda Guzman');
            })
            .then(done, done);
    });

    it('drops the collection', done => {
        assert.typeOf(collection.drop, 'function');
        assert.typeOf(connection.hasCollection, 'function');

        const hasCollection = connection.hasCollection(collectionName);
        assert.isBoolean(hasCollection);
        assert.isTrue(hasCollection);

        collection.drop()
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                const hasCollection = connection.hasCollection(collectionName);
                assert.isBoolean(hasCollection);
                assert.isFalse(hasCollection);

                collection = null;
            })
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .then(done, done);
    });

    it('retrieves the same collection yet again', done => {
        assert.typeOf(connection.collection, 'function');
        assert.typeOf(connection.hasCollection, 'function');

        const hasCollection = connection.hasCollection(collectionName);
        assert.isBoolean(hasCollection);
        assert.isFalse(hasCollection);

        connection.collection(collectionName)
            .then(col => {
                assert.isFalse(connection.error());
                assert.isNull(connection.lastError());

                assert.instanceOf(col, types.Collection);
                assert.isFalse(col.error());

                const hasCollection = connection.hasCollection(collectionName);
                assert.isBoolean(hasCollection);
                assert.isTrue(hasCollection);

                collection = col;
            })
            .then(done, done);
    });

    it(`searches for the same value yet again (field 'name', value 'Lawanda Guzman')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ name: 'Lawanda Guzman' })
            .then(docs => {
                assert.isTrue(collection.error());
                assert.isNotNull(collection.lastError());
                assert.equal(collection.lastError().indexOf(constants.Errors.NotIndexedField), 0);

                assert.equal(docs.length, 0);
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

    it('drops current database', done => {
        assert.typeOf(DocsOnFileDB.dropDatabase, 'function');

        const dbFullPath = types.DocsOnFileDB.GuessDatabasePath(dbName, dbDirPath);
        let stat = null;
        try { stat = fs.statSync(dbFullPath); } catch (e) { }
        assert.isNotNull(stat);

        DocsOnFileDB.dropDatabase(dbName, dbDirPath)
            .then(() => {
                stat = null;
                try { stat = fs.statSync(dbFullPath); } catch (e) { }
                assert.isNull(stat);
            })
            .then(done, done);
    });

    it(`drops a database that doesn't exist`, done => {
        assert.typeOf(DocsOnFileDB.dropDatabase, 'function');

        DocsOnFileDB.dropDatabase(dbName, dbDirPath)
            .then(() => {
                assert.isTrue(false, `a success was not expected at this point.`);
            })
            .catch(err => {
                assert.isNotNull(err);
                assert.equal(err.indexOf(constants.Errors.DatabaseDoesntExist), 0);
            })
            .then(done, done);
    });

    it(`connects to an invalid database`, done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        const dbFullPath = types.DocsOnFileDB.GuessDatabasePath(invalidDbName, dbDirPath);
        fs.writeFileSync(dbFullPath, 'NOT A DATABASE');

        let stat = null;
        try { stat = fs.statSync(dbFullPath); } catch (e) { }
        assert.isNotNull(stat);

        DocsOnFileDB.connect(invalidDbName, dbDirPath, null)
            .then(db => {
                assert.isTrue(false, `a success was not expected at this point.`);
            })
            .catch(err => {
                assert.equal(err.indexOf(constants.Errors.DatabaseNotValid), 0);
            })
            .then(done, done);
    });

    it(`drops a database that isn't a valid database`, done => {
        assert.typeOf(DocsOnFileDB.dropDatabase, 'function');

        const dbFullPath = types.DocsOnFileDB.GuessDatabasePath(invalidDbName, dbDirPath);
        fs.writeFileSync(dbFullPath, 'NOT A DATABASE');

        let stat = null;
        try { stat = fs.statSync(dbFullPath); } catch (e) { }
        assert.isNotNull(stat);

        DocsOnFileDB.dropDatabase(invalidDbName, dbDirPath)
            .then(() => {
                assert.isTrue(false, `a success was not expected at this point.`);
            })
            .catch(err => {
                assert.equal(err.indexOf(constants.Errors.DatabaseNotValid), 0);
            })
            .then(done, done);
    });
});
