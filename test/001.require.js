'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const path = require('path');

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Require', function () {
    const dfdb = require('..');

    it(`loads a valid object`, () => {
        assert.typeOf(dfdb, 'object');

        assert.property(dfdb, 'dfdb');
        assert.property(dfdb, 'DocsOnFileDB');
        assert.property(dfdb, 'types');
        assert.property(dfdb, 'constants');
    });

    it(`loads a proper list of types`, () => {
        assert.typeOf(dfdb.types, 'object');

        assert.property(dfdb.types, 'Collection');
        assert.property(dfdb.types, 'Connection');
        assert.property(dfdb.types, 'DocsOnFileDB');
        assert.property(dfdb.types, 'Index');
        assert.property(dfdb.types, 'Rejection');
        assert.property(dfdb.types, 'Sequence');
        assert.property(dfdb.types, 'Tools');
    });

    it(`loads a proper list of constant lists`, () => {
        assert.typeOf(dfdb.constants, 'object');

        assert.property(dfdb.constants, 'BasicConstants');
        assert.property(dfdb.constants, 'CollectionTypes');
        assert.property(dfdb.constants, 'ConnectionSaveConstants');
        assert.property(dfdb.constants, 'RejectionCodes');
    });

    it(`loads a proper list of basic constants`, () => {
        //assert.typeOf(dfdb.constants.BasicConstants, 'object');

        assert.property(dfdb.constants.BasicConstants, 'DBExtension');
        assert.property(dfdb.constants.BasicConstants, 'DefaultSequence');

        assert.isString(dfdb.constants.BasicConstants.DefaultSequence);
    });

    it(`loads a proper list of collection types`, () => {
        //assert.typeOf(dfdb.constants.ConnectionSaveConstants, 'object');

        assert.property(dfdb.constants.CollectionTypes, 'Heavy');
        assert.property(dfdb.constants.CollectionTypes, 'Simple');

        assert.isString(dfdb.constants.CollectionTypes.Heavy);
        assert.isString(dfdb.constants.CollectionTypes.Simple);
    });

    it(`loads a proper list of connection constants`, () => {
        //assert.typeOf(dfdb.constants.ConnectionSaveConstants, 'object');

        assert.property(dfdb.constants.ConnectionSaveConstants, 'LoadFile');
        assert.property(dfdb.constants.ConnectionSaveConstants, 'RemoveFile');
        assert.property(dfdb.constants.ConnectionSaveConstants, 'UpdateFile');

        assert.isString(dfdb.constants.ConnectionSaveConstants.LoadFile);
        assert.isString(dfdb.constants.ConnectionSaveConstants.RemoveFile);
        assert.isString(dfdb.constants.ConnectionSaveConstants.UpdateFile);
    });

    it(`loads a proper list of known errors constants`, () => {
        //assert.typeOf(dfdb.constants.RejectionCodes, 'object');

        assert.property(dfdb.constants.RejectionCodes, 'DocIsNotObject');
        assert.property(dfdb.constants.RejectionCodes, 'DocNotFound');
        assert.property(dfdb.constants.RejectionCodes, 'NotIndexableValue');
        assert.property(dfdb.constants.RejectionCodes, 'DuplicatedIndex');
        assert.property(dfdb.constants.RejectionCodes, 'NotIndexedField');
        assert.property(dfdb.constants.RejectionCodes, 'CollectionNotConnected');
        assert.property(dfdb.constants.RejectionCodes, 'IndexNotConnected');
        assert.property(dfdb.constants.RejectionCodes, 'SequenceNotConnected');
        assert.property(dfdb.constants.RejectionCodes, 'DatabaseDoesntExist');
        assert.property(dfdb.constants.RejectionCodes, 'DatabaseNotValid');
        assert.property(dfdb.constants.RejectionCodes, 'UnknownIndex');
        assert.property(dfdb.constants.RejectionCodes, 'DatabaseNotConnected');
        assert.property(dfdb.constants.RejectionCodes, 'SchemaDoesntApply');
        assert.property(dfdb.constants.RejectionCodes, 'InvalidSchema');
        assert.property(dfdb.constants.RejectionCodes, 'UnknownError');

        assert.isString(dfdb.constants.RejectionCodes.DocIsNotObject);
        assert.isString(dfdb.constants.RejectionCodes.DocNotFound);
        assert.isString(dfdb.constants.RejectionCodes.NotIndexableValue);
        assert.isString(dfdb.constants.RejectionCodes.DuplicatedIndex);
        assert.isString(dfdb.constants.RejectionCodes.NotIndexedField);
        assert.isString(dfdb.constants.RejectionCodes.CollectionNotConnected);
        assert.isString(dfdb.constants.RejectionCodes.IndexNotConnected);
        assert.isString(dfdb.constants.RejectionCodes.SequenceNotConnected);
        assert.isString(dfdb.constants.RejectionCodes.DatabaseDoesntExist);
        assert.isString(dfdb.constants.RejectionCodes.DatabaseNotValid);
        assert.isString(dfdb.constants.RejectionCodes.UnknownIndex);
        assert.isString(dfdb.constants.RejectionCodes.DatabaseNotConnected);
        assert.isString(dfdb.constants.RejectionCodes.SchemaDoesntApply);
        assert.isString(dfdb.constants.RejectionCodes.InvalidSchema);
        assert.isString(dfdb.constants.RejectionCodes.UnknownError);
    });

    it(`builds a simple rejection object`, () => {
        const { Rejection } = dfdb.types;
        const { RejectionCodes } = dfdb.constants;

        const rejection = new Rejection(RejectionCodes.UnknownError);

        assert.typeOf(rejection.code, 'function');
        assert.typeOf(rejection.data, 'function');
        assert.typeOf(rejection.message, 'function');

        assert.strictEqual(rejection.code(), RejectionCodes.UnknownError);
        assert.strictEqual(rejection.data(), null);
        assert.strictEqual(rejection.message(), RejectionCodes.Message(RejectionCodes.UnknownError));
        assert.strictEqual(`${rejection}`, `[${RejectionCodes.UnknownError}] ${RejectionCodes.Message(RejectionCodes.UnknownError)}`);
    });

    it(`builds a rejection object with extra information in a string`, () => {
        const { Rejection } = dfdb.types;
        const { RejectionCodes } = dfdb.constants;

        const rejection = new Rejection(RejectionCodes.UnknownError, 'SOME MESSAGE');

        assert.typeOf(rejection.code, 'function');
        assert.typeOf(rejection.data, 'function');
        assert.typeOf(rejection.message, 'function');

        assert.strictEqual(rejection.code(), RejectionCodes.UnknownError);
        assert.strictEqual(rejection.data(), 'SOME MESSAGE');
        assert.strictEqual(rejection.message(), `${RejectionCodes.Message(RejectionCodes.UnknownError)}. SOME MESSAGE.`);
        assert.strictEqual(`${rejection}`, `[${RejectionCodes.UnknownError}] ${RejectionCodes.Message(RejectionCodes.UnknownError)}. SOME MESSAGE.`);
    });

    it(`builds a rejection object with extra information in an object`, () => {
        const { Rejection } = dfdb.types;
        const { RejectionCodes } = dfdb.constants;
        const data = {
            integer: 11,
            float: 22.2,
            string: ' 33 '
        };

        const rejection = new Rejection(RejectionCodes.UnknownError, data);

        assert.typeOf(rejection.code, 'function');
        assert.typeOf(rejection.data, 'function');
        assert.typeOf(rejection.message, 'function');

        assert.strictEqual(rejection.code(), RejectionCodes.UnknownError);
        assert.strictEqual(rejection.data().integer, 11);
        assert.strictEqual(rejection.data().float, 22.2);
        assert.strictEqual(rejection.data().string, ' 33 ');
        assert.strictEqual(rejection.message(), `${RejectionCodes.Message(RejectionCodes.UnknownError)}. Integer: '11'. Float: '22.2'. String: ' 33 '.`);
        assert.strictEqual(`${rejection}`, `[${RejectionCodes.UnknownError}] ${RejectionCodes.Message(RejectionCodes.UnknownError)}. Integer: '11'. Float: '22.2'. String: ' 33 '.`);
    });
});
