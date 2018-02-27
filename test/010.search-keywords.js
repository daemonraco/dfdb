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

    it(`searches for an exact value in an indexed field using an alias`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: { '=': 'ISOPLEX' } })
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

    it(`searches for an exact value in an unindexed field using an alias`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { '=': 'davidsonhicks@hawkster.com' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '103');
                assert.strictEqual(docs[0].email, 'davidsonhicks@hawkster.com');
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

    it(`searches an indexed field with an empty object as condition`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: {} })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 200);
            }).then(done, done);
    });

    it(`searches an unindexed field with an empty object as condition`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: {} })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 198);
            }).then(done, done);
    });

    it(`searches an unindexed field with wrong condition keyword`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { $bad_keyword: 'some value' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 0);
            }).then(done, done);
    });

    it(`searches for a value of an indexed field that matches another in a list`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: { $in: ['ISOPLEX', 'VERBUS'] } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 3);
                assert.strictEqual(docs[0]._id, '7');
                assert.strictEqual(docs[1]._id, '10');
                assert.strictEqual(docs[2]._id, '147');
                assert.strictEqual(docs[0].company, 'ISOPLEX');
                assert.strictEqual(docs[1].company, 'VERBUS');
                assert.strictEqual(docs[2].company, 'ISOPLEX');
            }).then(done, done);
    });

    it(`searches for a value of an unindexed field that matches another in a list`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { $in: ['lakishapuckett@isoplex.com', 'navarrolevine@quiltigen.com'] } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 2);
                assert.strictEqual(docs[0]._id, '7');
                assert.strictEqual(docs[1]._id, '108');
                assert.strictEqual(docs[0].email, 'lakishapuckett@isoplex.com');
                assert.strictEqual(docs[1].email, 'navarrolevine@quiltigen.com');
            }).then(done, done);
    });

    it(`searches for a value of an unindexed field that doesn't match another in a list`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { $notIn: ['lakishapuckett@isoplex.com', 'navarrolevine@quiltigen.com'] } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 196);
            }).then(done, done);
    });

    it(`searches values mixing 'in' and 'not-in'`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            email: {
                $notIn: ['mcdonaldrodriguez@telpod.com', 'lakishapuckett@isoplex.com'],
                $in: ['lakishapuckett@isoplex.com', 'navarrolevine@quiltigen.com', 'roseannwade@skyplex.com']
            }
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 2);
            assert.strictEqual(docs[0]._id, '108');
            assert.strictEqual(docs[1]._id, '190');
            assert.strictEqual(docs[0].email, 'navarrolevine@quiltigen.com');
            assert.strictEqual(docs[1].email, 'roseannwade@skyplex.com');
        }).then(done, done);
    });

    it(`searches ages greater than 27`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $gt: 27 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 116);
            }).then(done, done);
    });

    it(`searches ages greater than or equal to 30`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $ge: 30 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 97);
            }).then(done, done);
    });

    it(`searches ages lower than 23`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $lt: 23 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 28);
            }).then(done, done);
    });

    it(`searches ages lower than or equal to 26`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ age: { $le: 26 } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 73);
            }).then(done, done);
    });

    it(`searches ages between 22 and 29 (not including them)`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            age: {
                $gt: 22,
                $lt: 29
            }
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 59);
        }).then(done, done);
    });

    it(`searches ages between 22 and 29 (not including them) using alias keywords`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            age: {
                '>': 22,
                '<': 29
            }
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 59);
        }).then(done, done);
    });

    it(`searches ages between 22 and 29 (including them) using alias keywords`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({
            age: {
                '>=': 22,
                '<=': 29
            }
        }).then(docs => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.strictEqual(docs.length, 80);
        }).then(done, done);
    });

    it(`searches for a partial value using keywords in an indexed field`, done => {
        assert.typeOf(collection.find, 'function');

        collection.find({ company: { $like: 'ISOPLEX' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 3);
                assert.strictEqual(docs[0]._id, '7');
                assert.strictEqual(docs[1]._id, '147');
                assert.strictEqual(docs[2]._id, '152');
                assert.strictEqual(docs[0].company, 'ISOPLEX');
                assert.strictEqual(docs[1].company, 'ISOPLEX');
                assert.strictEqual(docs[2].company, 'IISOPLEXX');
            }).then(done, done);
    });

    it(`searches for a partial value using keywords in an unindexed field`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ email: { $like: 'avidsonhicks@hawkster.co' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '103');
                assert.strictEqual(docs[0].email, 'davidsonhicks@hawkster.com');
            }).then(done, done);
    });

    it(`searches for a value that match the pattern /^([i]{2}).*([X]{2})$/ using an unindexed field`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ company: { $regex: /^([i]{2}).*([X]{2})$/ } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 1);
                assert.strictEqual(docs[0]._id, '152');
                assert.strictEqual(docs[0].company, 'IISOPLEXX');
            }).then(done, done);
    });

    it(`searches for a value that match a wrong pattern using an unindexed field`, done => {
        assert.typeOf(collection.search, 'function');

        collection.search({ company: { $regex: 'NOT A PATTERN' } })
            .then(docs => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());

                assert.strictEqual(docs.length, 0);
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
