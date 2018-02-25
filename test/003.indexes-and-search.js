'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '003.testdb';
const collectionName = 'test_collection';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Indexes and Searches [003]', function () {
    this.timeout(6000);

    const { constants, DocsOnFileDB, types } = require('..');
    const { RejectionCodes } = constants;
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
        const run = () => {
            const doc = docs.shift();

            if (doc) {
                collection.insert(doc)
                    .then(insertedDoc => {
                        assert.isFalse(collection.error());
                        assert.isNull(collection.lastError());

                        assert.typeOf(insertedDoc, 'object');

                        run();
                    });
            } else {
                done();
            }
        };
        run();
    });

    it(`adds an index for field 'email'`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('email')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            })
            .then(done, done);
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

    it(`re-adds an index for field 'company'`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('company')
            .then(() => {
                assert.isTrue(false, `a success was not expected at this point.`);
            })
            .catch(err => {
                const expectedErrorMessage = RejectionCodes.Message(RejectionCodes.DuplicatedIndex, true);
                assert.strictEqual(`${err}`.indexOf(expectedErrorMessage), 0);

                assert.isTrue(collection.error());
                assert.isNotNull(collection.lastError());
                assert.strictEqual(collection.lastError().indexOf(expectedErrorMessage), 0);
            })
            .then(done, done);
    });

    it('inserts more example documents', done => {
        assert.typeOf(collection.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.002.json')));
        const run = () => {
            const doc = docs.shift();

            if (doc) {
                collection.insert(doc)
                    .then(insertedDoc => {
                        assert.isFalse(collection.error());
                        assert.isNull(collection.lastError());

                        assert.typeOf(insertedDoc, 'object');

                        run();
                    });
            } else {
                done();
            }
        };
        run();
    });

    it('updates an indexed document', done => {
        assert.typeOf(collection.update, 'function');

        const newData = {
            "isActive": false,
            "age": 32,
            "name": "Blanchard Chen",
            "gender": "male",
            "email": "blanchardchen@verbus.com",
            "about": "Quis voluptate enim consequat pariatur laborum officia culpa proident officia veniam. Proident sit anim anim sunt. Enim excepteur ipsum excepteur reprehenderit quis laboris sit incididunt nostrud. Quis sint ex labore consectetur aliqua irure tempor reprehenderit deserunt quis id in occaecat proident.\r\n",
            "tags": ["aliquip", "do", "ex", "anim", "quis", "occaecat", "veniam"],
            "_id": 91,
            "_created": "2018-02-08T18:50:11.835Z",
            "_updated": "2018-02-08T18:50:11.835Z"
        };

        collection.update(91, newData)
            .then(updatedDoc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.typeOf(updatedDoc, 'object');
            })
            .then(done, done);
    });

    it(`searches a value on a not indexed field`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ name: 'something' })
            .then(docs => {
                const expectedErrorMessage = RejectionCodes.Message(RejectionCodes.NotIndexedField, true);

                assert.isTrue(collection.error());
                assert.isNotNull(collection.lastError());
                assert.strictEqual(collection.lastError().indexOf(expectedErrorMessage), 0);
            })
            .then(done, done);
    });

    it(`searches for an exact value on field 'company' (value 'INDEXIA')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: 'INDEXIA' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '102');
                assert.strictEqual(docs[0].name, 'Kristine Perry');
            })
            .then(done, done);
    });

    it(`searches for a partial value on field 'email' (value 'lolaparks')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ email: 'lolaparks' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '6');
                assert.strictEqual(docs[0].name, 'Lola Parks');
            })
            .then(done, done);
    });

    it(`searches for an exact value on field 'company' with more than 1 result (value 'ISOPLEX')`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: 'ISOPLEX' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 3);

                assert.strictEqual(docs[0]._id, '7');
                assert.strictEqual(docs[0].name, 'Lakisha Puckett');

                assert.strictEqual(docs[1]._id, '147');
                assert.strictEqual(docs[1].name, 'Ann Mayo');

                assert.strictEqual(docs[2]._id, '152');
                assert.strictEqual(docs[2].name, 'Grant Joyce');
            })
            .then(done, done);
    });

    it(`searches for something that doesn't exist`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: 'ISOPLEXISOPLEX' })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 0);
            })
            .then(done, done);
    });

    it(`searches for the first document for a condition`, done => {
        assert.typeOf(collection.findOne, 'function');

        collection.findOne({ email: 'blanchardchen' })
            .then(doc => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.isNotNull(doc.length);
                assert.strictEqual(doc._id, '10');
                assert.strictEqual(doc.name, 'Blanchard Chen');
            })
            .then(done, done);
    });

    it(`searches for more than one field`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({
            email: 'lakishapuckett',
            company: 'ISOPLEX'
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 1);
            assert.strictEqual(docs[0]._id, '7');
            assert.strictEqual(docs[0].name, 'Lakisha Puckett');
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
