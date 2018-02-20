'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const path = require('path');

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Require', function () {
    const dfdb = require('..');
    const Tools = dfdb.types.Tools;

    it(`Merge of two simple objects`, () => {
        const left = {
            1: 1,
            a: 10,
            b: 20.2,
            c: ' 30 '
        };
        const right = {
            2: 2,
            d: 40,
            e: 50.5,
            f: ' 60 '
        };
        const resutls = Tools.DeepMergeObjects(left, right);

        assert.property(resutls, '1');
        assert.property(resutls, '2');
        assert.property(resutls, 'a');
        assert.property(resutls, 'b');
        assert.property(resutls, 'c');
        assert.property(resutls, 'd');
        assert.property(resutls, 'e');
        assert.property(resutls, 'f');

        assert.strictEqual(resutls['1'], 1);
        assert.strictEqual(resutls['2'], 2);
        assert.strictEqual(resutls.a, 10);
        assert.strictEqual(resutls.b, 20.2);
        assert.strictEqual(resutls.c, ' 30 ');
        assert.strictEqual(resutls.d, 40);
        assert.strictEqual(resutls.e, 50.5);
        assert.strictEqual(resutls.f, ' 60 ');
    });

    it(`Merge of two arrays`, () => {
        const left = [1, 10, 20.2, ' 30 '];
        const right = [2, 40, 50.5, ' 60 '];
        const resutls = Tools.DeepMergeObjects(left, right);

        assert.isArray(resutls);
        assert.strictEqual(resutls.length, 8);

        assert.strictEqual(resutls[0], 1);
        assert.strictEqual(resutls[1], 10);
        assert.strictEqual(resutls[2], 20.2);
        assert.strictEqual(resutls[3], ' 30 ');
        assert.strictEqual(resutls[4], 2);
        assert.strictEqual(resutls[5], 40);
        assert.strictEqual(resutls[6], 50.5);
        assert.strictEqual(resutls[7], ' 60 ');
    });

    it(`Merge a simple object with an array`, () => {
        const left = {
            1: 1,
            a: 10,
            b: 20.2,
            c: ' 30 '
        };
        const right = [2, 40, 50.5, ' 60 '];
        const resutls = Tools.DeepMergeObjects(left, right);

        assert.strictEqual(Object.keys(resutls).length, 4);

        assert.property(resutls, '1');
        assert.property(resutls, 'a');
        assert.property(resutls, 'b');
        assert.property(resutls, 'c');

        assert.strictEqual(resutls['1'], 1);
        assert.strictEqual(resutls.a, 10);
        assert.strictEqual(resutls.b, 20.2);
        assert.strictEqual(resutls.c, ' 30 ');
    });

    it(`Merge an array with a simple object`, () => {
        const left = [1, 10, 20.2, ' 30 '];
        const right = {
            2: 2,
            d: 40,
            e: 50.5,
            f: ' 60 '
        };
        const resutls = Tools.DeepMergeObjects(left, right);

        assert.isArray(resutls, 4);
        assert.strictEqual(resutls.length, 4);

        assert.strictEqual(resutls[0], 1);
        assert.strictEqual(resutls[1], 10);
        assert.strictEqual(resutls[2], 20.2);
        assert.strictEqual(resutls[3], ' 30 ');
    });

    it(`Merge of two complex objects`, () => {
        const left = {
            1: 1,
            a: 10,
            b: 20.2,
            c: ' 30 ',
            aa: {
                v: 11,
                x: '33',
                y: {
                    alfa: 111,
                    beta: '222'
                },
                z: [55, 66.6]
            }
        };
        const right = {
            2: 2,
            d: 40,
            e: 50.5,
            f: ' 60 ',
            aa: {
                w: '22',
                x: '44',
                y: {
                    beta: '333',
                    delta: 444.4
                },
                z: ['77']
            }
        };
        const resutls = Tools.DeepMergeObjects(left, right);

        assert.property(resutls, '1');
        assert.property(resutls, '2');
        assert.property(resutls, 'a');
        assert.property(resutls, 'b');
        assert.property(resutls, 'c');
        assert.property(resutls, 'aa');

        assert.strictEqual(resutls['1'], 1);
        assert.strictEqual(resutls['2'], 2);
        assert.strictEqual(resutls.a, 10);
        assert.strictEqual(resutls.b, 20.2);
        assert.strictEqual(resutls.c, ' 30 ');
        assert.isObject(resutls.aa);

        assert.property(resutls.aa, 'v');
        assert.property(resutls.aa, 'w');
        assert.property(resutls.aa, 'x');
        assert.property(resutls.aa, 'y');
        assert.property(resutls.aa, 'z');

        assert.strictEqual(resutls.aa.v, 11);
        assert.strictEqual(resutls.aa.w, '22');
        assert.strictEqual(resutls.aa.x, '44');

        assert.isObject(resutls.aa.y);
        assert.isArray(resutls.aa.z);

        assert.property(resutls.aa.y, 'alfa');
        assert.property(resutls.aa.y, 'beta');
        assert.property(resutls.aa.y, 'delta');

        assert.strictEqual(resutls.aa.y.alfa, 111);
        assert.strictEqual(resutls.aa.y.beta, '333');
        assert.strictEqual(resutls.aa.y.delta, 444.4);

        assert.strictEqual(resutls.aa.z.length, 3);

        assert.strictEqual(resutls.aa.z[0], 55);
        assert.strictEqual(resutls.aa.z[1], 66.6);
        assert.strictEqual(resutls.aa.z[2], '77');
    });

    it(`Deep-copies an object and checks how it reacts to modifications`, () => {
        const check = (copy) => {
            assert.property(copy, '1');
            assert.property(copy, 'a');
            assert.property(copy, 'b');
            assert.property(copy, 'c');
            assert.property(copy, 'aa');

            assert.strictEqual(copy['1'], 1);
            assert.strictEqual(copy.a, 10);
            assert.strictEqual(copy.b, 20.2);
            assert.strictEqual(copy.c, ' 30 ');

            assert.isObject(copy.aa);
            assert.property(copy.aa, 'v');
            assert.property(copy.aa, 'x');
            assert.property(copy.aa, 'y');
            assert.property(copy.aa, 'z');

            assert.strictEqual(copy.aa.v, 11);
            assert.strictEqual(copy.aa.x, '33');

            assert.isObject(copy.aa.y);
            assert.isArray(copy.aa.z);

            assert.property(copy.aa.y, 'alfa');
            assert.property(copy.aa.y, 'beta');

            assert.strictEqual(copy.aa.y.alfa, 111);
            assert.strictEqual(copy.aa.y.beta, '222');

            assert.strictEqual(copy.aa.z.length, 2);

            assert.strictEqual(copy.aa.z[0], 55);
            assert.strictEqual(copy.aa.z[1], 66.6);
        }

        const orginal = {
            1: 1,
            a: 10,
            b: 20.2,
            c: ' 30 ',
            aa: {
                v: 11,
                x: '33',
                y: {
                    alfa: 111,
                    beta: '222'
                },
                z: [55, 66.6]
            }
        };

        let copy = Tools.DeepCopy(orginal);
        check(orginal);
        check(copy);

        copy.aa.y.beta = 'changed value';
        check(orginal);
    });
});
