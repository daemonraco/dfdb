'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const fs = require('fs');
const md5 = require('md5');
const path = require('path');

// ---------------------------------------------------------------------------- //
// Values.
const dbName = '008.testdb';
const collectionName = 'test_collection';
const rightSchema = {
    type: 'object',
    properties: {
        isActive: { type: 'boolean' },
        age: { type: 'integer' },
        name: { type: 'string' },
        gender: { type: 'string' },
        company: { type: 'string' },
        xcompany: {
            type: 'string',
            default: 'NO COMPANY'
        },
        email: { type: 'string' },
        about: { type: 'string' },
        tags: { type: 'array' }
    },
    required: ['isActive', 'age', 'name', 'gender', 'company', 'about', 'tags']
};
const similarSchema = {
    type: 'object',
    properties: {
        isActive: { type: 'boolean' },
        age: { type: 'integer' },
        name: { type: 'string' },
        gender: { type: 'string' },
        company: { type: 'string' },
        email: { type: 'string' },
        about: { type: 'string' },
        tags: { type: 'array' }
    },
    required: ['isActive', 'age', 'name', 'gender', 'company', 'about', 'tags']
};
const wrongSchema = {
    type: 'object',
    properties: {
        isActive: { type: 'boolean' },
        age: { type: 'integer' },
        name: { type: 'string' },
        gender: { type: 'string' },
        company: { type: 'string' },
        xcompany: {
            type: 'string',
            default: 'NO COMPANY'
        },
        email: { type: 'string' },
        about: { type: 'string' },
        tags: { type: 'array' }
    },
    required: ['isActive', 'age', 'name', 'gender', 'company', 'email', 'about', 'tags']
};

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Collection schemas', function () {
    this.timeout(12000);

    const { DocsOnFileDB, types, constants } = require('..');
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
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
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
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
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
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .then(done, done);
    });

    it(`adds an index for field 'xcompany' that should be added later by the schema`, done => {
        assert.typeOf(collection.addFieldIndex, 'function');

        collection.addFieldIndex('xcompany')
            .then(() => {
                assert.isFalse(collection.error());
                assert.isNull(collection.lastError());
            })
            .then(done, done);
    });

    it(`searching and checking a document before assigning a schema`, done => {
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

            assert.notProperty(docs[0], 'xcompany');
        }).then(done, done);
    });

    it(`checking it does not have a schema`, () => {
        assert.typeOf(collection.hasSchema, 'function');
        assert.isFalse(collection.hasSchema());

        assert.typeOf(collection.schema, 'function');
        const schema = collection.schema();
        assert.isNull(schema);
    });

    it(`setting a schema`, done => {
        assert.typeOf(collection.setSchema, 'function');

        collection.setSchema(rightSchema).then(() => {
            assert.isNull(collection.lastError());
        }).then(done, done);
    });

    it(`setting the same schema again`, done => {
        assert.typeOf(collection.setSchema, 'function');

        collection.setSchema(rightSchema).then(() => {
            assert.isNull(collection.lastError());
        }).then(done, done);
    });

    it(`checking it does have a schema and it's the assigned one`, () => {
        assert.typeOf(collection.hasSchema, 'function');
        assert.isTrue(collection.hasSchema());

        assert.typeOf(collection.schema, 'function');
        const schema = collection.schema();
        const schemaMD5 = md5(JSON.stringify(schema));
        const rightSchemaMD5 = md5(JSON.stringify(rightSchema));
        assert.strictEqual(schemaMD5, rightSchemaMD5);
    });

    it(`searching and checking a document after assigning a schema`, done => {
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
            assert.strictEqual(docs[0].xcompany, 'NO COMPANY');
        }).then(done, done);
    });

    it('inserts a new document that follows the schema', done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({
            isActive: false,
            age: 99,
            name: 'Some Name',
            gender: 'female',
            company: 'SOME COMPANY',
            xcompany: 'SOME XCOMPANY',
            about: 'SOME DATA ABOUT IT',
            tags: ['tag1', 'tag2']
        }).then(insertedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(insertedDoc, 'object');

            assert.property(insertedDoc, '_id');
            assert.property(insertedDoc, '_created');
            assert.property(insertedDoc, '_updated');
            assert.property(insertedDoc, 'name');
            assert.property(insertedDoc, 'xcompany');

            assert.isString(insertedDoc._id);
            assert.instanceOf(insertedDoc._created, Date);
            assert.instanceOf(insertedDoc._updated, Date);

            assert.strictEqual(insertedDoc._id, '201');
            assert.strictEqual(insertedDoc.name, 'Some Name');
            assert.strictEqual(insertedDoc.xcompany, 'SOME XCOMPANY');
        }).then(done, done);
    });

    it('inserts a new document that follows the schema and has an unknown field', done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({
            isActive: false,
            age: 99,
            name: 'Some Name',
            gender: 'female',
            company: 'SOME COMPANY',
            xcompany: 'SOME XCOMPANY',
            about: 'SOME DATA ABOUT IT',
            newFiled: 'SOME DATA',
            tags: ['tag1', 'tag2']
        }).then(insertedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(insertedDoc, 'object');

            assert.property(insertedDoc, '_id');
            assert.property(insertedDoc, '_created');
            assert.property(insertedDoc, '_updated');
            assert.property(insertedDoc, 'name');
            assert.property(insertedDoc, 'xcompany');
            assert.property(insertedDoc, 'newFiled');

            assert.isString(insertedDoc._id);
            assert.instanceOf(insertedDoc._created, Date);
            assert.instanceOf(insertedDoc._updated, Date);

            assert.strictEqual(insertedDoc._id, '202');
            assert.strictEqual(insertedDoc.name, 'Some Name');
            assert.strictEqual(insertedDoc.xcompany, 'SOME XCOMPANY');
            assert.strictEqual(insertedDoc.newFiled, 'SOME DATA');
        }).then(done, done);
    });

    it('inserts a new document that follows the schema and lacks a default field', done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({
            isActive: false,
            age: 99,
            name: 'Some Name',
            gender: 'female',
            company: 'SOME COMPANY',
            about: 'SOME DATA ABOUT IT',
            tags: ['tag1', 'tag2']
        }).then(insertedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(insertedDoc, 'object');

            assert.property(insertedDoc, '_id');
            assert.property(insertedDoc, '_created');
            assert.property(insertedDoc, '_updated');
            assert.property(insertedDoc, 'name');
            assert.property(insertedDoc, 'xcompany');

            assert.isString(insertedDoc._id);
            assert.instanceOf(insertedDoc._created, Date);
            assert.instanceOf(insertedDoc._updated, Date);

            assert.strictEqual(insertedDoc._id, '203');
            assert.strictEqual(insertedDoc.name, 'Some Name');
            assert.strictEqual(insertedDoc.xcompany, 'NO COMPANY');
        }).then(done, done);
    });

    it(`inserts a new document that doesn't follows the schema`, done => {
        assert.typeOf(collection.insert, 'function');

        collection.insert({
            isActive: false,
            age: 99,
            name: 'Some Name',
            company: 'SOME COMPANY',
            about: 'SOME DATA ABOUT IT',
            tags: ['tag1', 'tag2']
        }).catch(err => {
            assert.isNotNull(collection.lastError());
            assert.strictEqual(err.indexOf(constants.Errors.SchemaDoesntApply), 0);
            assert.strictEqual(collection.lastError().indexOf(constants.Errors.SchemaDoesntApply), 0);
        }).then(done, done);
    });

    it('updates a document with another that follows the schema', done => {
        assert.typeOf(collection.update, 'function');

        collection.update('7', {
            isActive: false,
            age: 24,
            name: 'Lakisha Puckett',
            gender: 'female',
            company: 'ISOPLEX',
            xcompany: 'SOME XCOMPANY',
            email: 'lakishapuckett@isoplex.com',
            about: 'Reprehenderit excepteur enim qui reprehenderit. Occaecat sit ipsum sit qui ipsum ad quis irure veniam magna reprehenderit enim adipisicing ut. Laborum veniam Lorem do exercitation. In do culpa magna ad qui sint eu veniam. In ullamco veniam dolore dolor ullamco magna. Dolor consectetur reprehenderit sunt incididunt adipisicing. Laboris amet aute tempor ad incididunt anim culpa laborum qui in aliquip et id.\r\n',
            tags: ['qui', 'nostrud', 'cillum', 'nulla', 'deserunt', 'reprehenderit', 'adipisicing'],
            extradata: 'somedata'
        }).then(updatedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(updatedDoc, 'object');

            assert.property(updatedDoc, '_id');
            assert.property(updatedDoc, '_created');
            assert.property(updatedDoc, '_updated');
            assert.property(updatedDoc, 'name');
            assert.property(updatedDoc, 'xcompany');

            assert.isString(updatedDoc._id);
            assert.instanceOf(updatedDoc._created, Date);
            assert.instanceOf(updatedDoc._updated, Date);

            assert.strictEqual(updatedDoc._id, '7');
            assert.strictEqual(updatedDoc.name, 'Lakisha Puckett');
            assert.strictEqual(updatedDoc.xcompany, 'SOME XCOMPANY');
        }).then(done, done);
    });

    it('updates a document with another that follows the schema and has an unknown field', done => {
        assert.typeOf(collection.update, 'function');

        collection.update('7', {
            isActive: false,
            age: 24,
            name: 'Lakisha Puckett',
            gender: 'female',
            company: 'ISOPLEX',
            xcompany: 'SOME XCOMPANY',
            email: 'lakishapuckett@isoplex.com',
            newFiled: 'SOME DATA',
            about: 'Reprehenderit excepteur enim qui reprehenderit. Occaecat sit ipsum sit qui ipsum ad quis irure veniam magna reprehenderit enim adipisicing ut. Laborum veniam Lorem do exercitation. In do culpa magna ad qui sint eu veniam. In ullamco veniam dolore dolor ullamco magna. Dolor consectetur reprehenderit sunt incididunt adipisicing. Laboris amet aute tempor ad incididunt anim culpa laborum qui in aliquip et id.\r\n',
            tags: ['qui', 'nostrud', 'cillum', 'nulla', 'deserunt', 'reprehenderit', 'adipisicing'],
            extradata: 'somedata'
        }).then(updatedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(updatedDoc, 'object');

            assert.property(updatedDoc, '_id');
            assert.property(updatedDoc, '_created');
            assert.property(updatedDoc, '_updated');
            assert.property(updatedDoc, 'name');
            assert.property(updatedDoc, 'xcompany');
            assert.property(updatedDoc, 'newFiled');

            assert.isString(updatedDoc._id);
            assert.instanceOf(updatedDoc._created, Date);
            assert.instanceOf(updatedDoc._updated, Date);

            assert.strictEqual(updatedDoc._id, '7');
            assert.strictEqual(updatedDoc.name, 'Lakisha Puckett');
            assert.strictEqual(updatedDoc.xcompany, 'SOME XCOMPANY');
            assert.strictEqual(updatedDoc.newFiled, 'SOME DATA');
        }).then(done, done);
    });

    it('updates a document with another that follows the schema and lacks a default field', done => {
        assert.typeOf(collection.update, 'function');

        collection.update('7', {
            isActive: false,
            age: 24,
            name: 'Lakisha Puckett',
            gender: 'female',
            company: 'ISOPLEX',
            email: 'lakishapuckett@isoplex.com',
            about: 'Reprehenderit excepteur enim qui reprehenderit. Occaecat sit ipsum sit qui ipsum ad quis irure veniam magna reprehenderit enim adipisicing ut. Laborum veniam Lorem do exercitation. In do culpa magna ad qui sint eu veniam. In ullamco veniam dolore dolor ullamco magna. Dolor consectetur reprehenderit sunt incididunt adipisicing. Laboris amet aute tempor ad incididunt anim culpa laborum qui in aliquip et id.\r\n',
            tags: ['qui', 'nostrud', 'cillum', 'nulla', 'deserunt', 'reprehenderit', 'adipisicing'],
            extradata: 'somedata'
        }).then(updatedDoc => {
            assert.isFalse(collection.error());
            assert.isNull(collection.lastError());

            assert.typeOf(updatedDoc, 'object');

            assert.property(updatedDoc, '_id');
            assert.property(updatedDoc, '_created');
            assert.property(updatedDoc, '_updated');
            assert.property(updatedDoc, 'name');
            assert.property(updatedDoc, 'xcompany');

            assert.isString(updatedDoc._id);
            assert.instanceOf(updatedDoc._created, Date);
            assert.instanceOf(updatedDoc._updated, Date);

            assert.strictEqual(updatedDoc._id, '7');
            assert.strictEqual(updatedDoc.name, 'Lakisha Puckett');
            assert.strictEqual(updatedDoc.xcompany, 'NO COMPANY');
        }).then(done, done);
    });

    it(`updates a document with another that doesn't follows the schema`, done => {
        assert.typeOf(collection.update, 'function');

        collection.update('7', {
            isActive: false,
            age: 24,
            name: 'Lakisha Puckett',
            company: 'ISOPLEX',
            email: 'lakishapuckett@isoplex.com',
            about: 'Reprehenderit excepteur enim qui reprehenderit. Occaecat sit ipsum sit qui ipsum ad quis irure veniam magna reprehenderit enim adipisicing ut. Laborum veniam Lorem do exercitation. In do culpa magna ad qui sint eu veniam. In ullamco veniam dolore dolor ullamco magna. Dolor consectetur reprehenderit sunt incididunt adipisicing. Laboris amet aute tempor ad incididunt anim culpa laborum qui in aliquip et id.\r\n',
            tags: ['qui', 'nostrud', 'cillum', 'nulla', 'deserunt', 'reprehenderit', 'adipisicing'],
            extradata: 'somedata'
        }).catch(err => {
            assert.isNotNull(collection.lastError());
            assert.strictEqual(err.indexOf(constants.Errors.SchemaDoesntApply), 0);
            assert.strictEqual(collection.lastError().indexOf(constants.Errors.SchemaDoesntApply), 0);
        }).then(done, done);
    });

    it(`setting a wrong schema`, done => {
        assert.typeOf(collection.setSchema, 'function');

        collection.setSchema(wrongSchema).catch(err => {
            assert.isNotNull(collection.lastError());
            assert.strictEqual(err.indexOf(constants.Errors.SchemaDoesntApply), 0);
            assert.strictEqual(collection.lastError().indexOf(constants.Errors.SchemaDoesntApply), 0);
        }).then(done, done);
    });

    it(`checking it does have a schema and it's still the assigned one`, () => {
        assert.typeOf(collection.hasSchema, 'function');
        assert.isTrue(collection.hasSchema());

        assert.typeOf(collection.schema, 'function');
        const schema = collection.schema();
        const schemaMD5 = md5(JSON.stringify(schema));
        const rightSchemaMD5 = md5(JSON.stringify(rightSchema));
        assert.strictEqual(schemaMD5, rightSchemaMD5);
    });

    it(`setting a valid similar schema`, done => {
        assert.typeOf(collection.setSchema, 'function');

        collection.setSchema(similarSchema).then(() => {
            assert.isNull(collection.lastError());
        }).then(done, done);
    });

    it(`checking it does have a schema and it's the new one`, () => {
        assert.typeOf(collection.hasSchema, 'function');
        assert.isTrue(collection.hasSchema());

        assert.typeOf(collection.schema, 'function');
        const schema = collection.schema();
        const schemaMD5 = md5(JSON.stringify(schema));
        const similarSchemaMD5 = md5(JSON.stringify(similarSchema));
        assert.strictEqual(schemaMD5, similarSchemaMD5);
    });

    it(`removing a schema`, done => {
        assert.typeOf(collection.removeSchema, 'function');

        collection.removeSchema().then(() => {
            assert.isFalse(collection.error());
        }).then(done, done);
    });

    it(`checking it does not have a schema`, () => {
        assert.typeOf(collection.hasSchema, 'function');
        assert.isFalse(collection.hasSchema());

        assert.typeOf(collection.schema, 'function');
        const schema = collection.schema();
        assert.isNull(schema);
    });

    it(`removing a schema when it doesn't have one`, done => {
        assert.typeOf(collection.removeSchema, 'function');

        collection.removeSchema().then(() => {
            assert.isFalse(collection.error());
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
            .catch(err => {
                assert.isTrue(false, `a rejection was not expected at this point.`);
            })
            .then(done, done);
    });
});
