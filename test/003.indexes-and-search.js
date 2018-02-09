'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '003.testdb';
const tableName = 'test_table';

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Indexes and Searches', function () {
    //this.timeout(15000);
    //
    const { constants, DocsOnFileDB, types } = require('..');
    const dbDirPath = path.join(__dirname, '.tmpdb');

    let connection = null;
    let table = null;

    it('connects and returns a valid connected pointer', done => {
        assert.typeOf(DocsOnFileDB.connect, 'function');

        DocsOnFileDB.connect(dbName, dbDirPath, null, db => {
            assert.instanceOf(db, types.Connection);
            assert.typeOf(db.connected, 'function');
            assert.equal(db.connected(), true);

            assert.isFalse(db.error());

            connection = db;
            done();
        });
    });

    it('retrieves a new table and returns a valid one', done => {
        assert.typeOf(connection.table, 'function');

        connection.table(tableName, tab => {
            assert.isFalse(connection.error());
            assert.isNull(connection.lastError());

            assert.instanceOf(tab, types.Table);
            assert.isFalse(tab.error());

            table = tab;
            done();
        });
    });

    it('inserts example documents', done => {
        assert.typeOf(table.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.001.json')));
        const run = () => {
            const doc = docs.shift();

            if (doc) {
                table.insert(doc, insertedDoc => {
                    assert.isFalse(table.error());
                    assert.isNull(table.lastError());

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
        table.addFieldIndex('email', () => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            done();
        });
    });

    it(`adds an index for field 'company'`, done => {
        table.addFieldIndex('company', () => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            done();
        });
    });

    it(`re-adds an index for field 'company'`, done => {
        table.addFieldIndex('company', () => {
            assert.isTrue(table.error());
            assert.isNotNull(table.lastError());
            assert.equal(table.lastError().indexOf(constants.Errors.DuplicatedIndex), 0);

            done();
        });
    });

    it('inserts more example documents', done => {
        assert.typeOf(table.insert, 'function');

        let docs = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.002.json')));
        const run = () => {
            const doc = docs.shift();

            if (doc) {
                table.insert(doc, insertedDoc => {
                    assert.isFalse(table.error());
                    assert.isNull(table.lastError());

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

        table.update(91, newData, updatedDoc => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.typeOf(updatedDoc, 'object');

            done();
        });
    });

    it(`searches a value on a not indexed field`, done => {
        assert.typeOf(table.find, 'function');

        table.find({ name: 'something' }, docs => {
            assert.isTrue(table.error());
            assert.isNotNull(table.lastError());
            assert.equal(table.lastError().indexOf(constants.Errors.NotIndexedField), 0);

            done();
        });
    });

    it(`searches for an exact value on field 'company' (value 'INDEXIA')`, done => {
        assert.typeOf(table.find, 'function');

        table.find({ company: 'INDEXIA' }, docs => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 102);
            assert.equal(docs[0].name, 'Kristine Perry');

            done();
        });
    });

    it(`searches for a partial value on field 'email' (value 'lolaparks')`, done => {
        assert.typeOf(table.find, 'function');

        table.find({ email: 'lolaparks' }, docs => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 6);
            assert.equal(docs[0].name, 'Lola Parks');

            done();
        });
    });

    it(`searches for an exact value on field 'company' with more than 1 result (value 'ISOPLEX')`, done => {
        assert.typeOf(table.find, 'function');

        table.find({ company: 'ISOPLEX' }, docs => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.equal(docs.length, 2);

            assert.equal(docs[0]._id, 147);
            assert.equal(docs[0].name, 'Ann Mayo');

            assert.equal(docs[1]._id, 7);
            assert.equal(docs[1].name, 'Lakisha Puckett');

            done();
        });
    });

    it(`searches for something that doesn't exist`, done => {
        assert.typeOf(table.find, 'function');

        table.find({ company: 'ISOPLEXISOPLEX' }, docs => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.equal(docs.length, 0);

            done();
        });
    });

    it(`searches for the first document for a condition`, done => {
        assert.typeOf(table.find, 'function');

        table.findOne({ email: 'blanchardchen' }, doc => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.isNotNull(doc.length);
            assert.equal(doc._id, 10);
            assert.equal(doc.name, 'Blanchard Chen');

            done();
        });
    });

    it(`searches for more than one field`, done => {
        assert.typeOf(table.find, 'function');

        table.find({
            email: 'lakishapuckett',
            company: 'ISOPLEX'
        }, docs => {
            assert.isFalse(table.error());
            assert.isNull(table.lastError());

            assert.equal(docs.length, 1);
            assert.equal(docs[0]._id, 7);
            assert.equal(docs[0].name, 'Lakisha Puckett');

            done();
        });
    });

    it('closes the connection', done => {
        assert.typeOf(table.update, 'function');

        connection.close(() => {
            assert.isFalse(connection.connected());
            assert.isFalse(connection.error());
            assert.isNull(connection.lastError());

            done();
        });
    });
});
