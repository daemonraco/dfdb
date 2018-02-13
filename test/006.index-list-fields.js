'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '006.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Indexing fields that are lists', function () {
    this.timeout(2000);
    //this.timeout(6000);

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
            }).then(done, done);
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
            }).then(done, done);
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

    it(`adds an index for field 'tags' which is a list field`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('tags')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            }).then(done, done);
    });

    it(`searches for an indexed string tag`, done => {
        assert.typeOf(collection.search, 'function');

        collection.find({
            tags: 'Some-Unique-Tag-String'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 46);
            assert.equal(docs[0].name, 'Bruce Lott');
            assert.equal(docs[0].company, 'IMMUNICS');
            assert.equal(docs[0].email, 'brucelott@immunics.com');
            assert.notEqual(docs[0].tags.indexOf('some-unique-tag-string'), -1);
        }).then(done, done);
    });

    it(`searches for an indexed integer tag`, done => {
        assert.typeOf(collection.search, 'function');

        collection.find({
            tags: 123456
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 81);
            assert.equal(docs[0].name, 'Lorna Martin');
            assert.equal(docs[0].company, 'CINASTER');
            assert.equal(docs[0].email, 'lornamartin@cinaster.com');
            assert.notEqual(docs[0].tags.indexOf(123456), -1);
        }).then(done, done);
    });

    it(`searches for an indexed float tag`, done => {
        assert.typeOf(collection.search, 'function');

        collection.find({
            tags: 10.37
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 30);
            assert.equal(docs[0].name, 'Sawyer Weiss');
            assert.equal(docs[0].company, 'DELPHIDE');
            assert.equal(docs[0].email, 'sawyerweiss@delphide.com');
            assert.notEqual(docs[0].tags.indexOf(10.37), -1);
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
