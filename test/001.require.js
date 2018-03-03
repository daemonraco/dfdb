'use strict';

// ---------------------------------------------------------------------------- //
// Dependences.
const assert = require('chai').assert;
const path = require('path');

// ---------------------------------------------------------------------------- //
// Testing.
describe('dfdb: Require [001]', function () {
    const dfdb = require('..');

    it(`loads a valid object`, () => {
        assert.typeOf(dfdb, 'object');

        assert.property(dfdb, 'dfdb');
        assert.property(dfdb, 'DocsOnFileDB');
        assert.property(dfdb, 'DFDBGuessDatabasePath');
        assert.typeOf(dfdb.DFDBGuessDatabasePath, 'function');
    });

    it(`loads a proper list of types`, () => {
        assert.property(dfdb, 'Collection');
        assert.property(dfdb, 'Connection');
        assert.property(dfdb, 'DocsOnFileDB');
        assert.property(dfdb, 'Index');
        assert.property(dfdb, 'Rejection');
        assert.property(dfdb, 'Sequence');
        assert.property(dfdb, 'Tools');
    });

    it(`loads a proper list of constant lists`, () => {
        assert.property(dfdb, 'BasicConstants');
        assert.property(dfdb, 'CollectionTypes');
        assert.property(dfdb, 'ConnectionSaveConstants');
        assert.property(dfdb, 'RejectionCodes');
    });

    it(`loads a proper list of basic constants`, () => {
        const { BasicConstants } = dfdb;

        assert.property(BasicConstants, 'DBExtension');
        assert.property(BasicConstants, 'DefaultSequence');

        assert.isString(BasicConstants.DefaultSequence);
    });

    it(`loads a proper list of collection types`, () => {
        const { CollectionTypes } = dfdb;

        assert.property(CollectionTypes, 'Heavy');
        assert.property(CollectionTypes, 'Simple');

        assert.isString(CollectionTypes.Heavy);
        assert.isString(CollectionTypes.Simple);
    });

    it(`loads a proper list of connection constants`, () => {
        const { ConnectionSaveConstants } = dfdb;

        assert.property(ConnectionSaveConstants, 'LoadFile');
        assert.property(ConnectionSaveConstants, 'RemoveFile');
        assert.property(ConnectionSaveConstants, 'UpdateFile');

        assert.isString(ConnectionSaveConstants.LoadFile);
        assert.isString(ConnectionSaveConstants.RemoveFile);
        assert.isString(ConnectionSaveConstants.UpdateFile);
    });

    it(`loads a proper list of known errors constants`, () => {
        const { RejectionCodes } = dfdb;

        assert.property(RejectionCodes, 'DocIsNotObject');
        assert.property(RejectionCodes, 'DocNotFound');
        assert.property(RejectionCodes, 'NotIndexableValue');
        assert.property(RejectionCodes, 'DuplicatedIndex');
        assert.property(RejectionCodes, 'NotIndexedField');
        assert.property(RejectionCodes, 'CollectionNotConnected');
        assert.property(RejectionCodes, 'IndexNotConnected');
        assert.property(RejectionCodes, 'SequenceNotConnected');
        assert.property(RejectionCodes, 'DatabaseDoesntExist');
        assert.property(RejectionCodes, 'DatabaseNotValid');
        assert.property(RejectionCodes, 'UnknownIndex');
        assert.property(RejectionCodes, 'DatabaseNotConnected');
        assert.property(RejectionCodes, 'SchemaDoesntApply');
        assert.property(RejectionCodes, 'InvalidSchema');
        assert.property(RejectionCodes, 'UnknownError');
        assert.property(RejectionCodes, 'InvalidDBPath');
        assert.property(RejectionCodes, 'NotImplemented');
        assert.property(RejectionCodes, 'InvalidJSON');
        assert.property(RejectionCodes, 'InvalidJSONString');
        assert.property(RejectionCodes, 'InvalidJSONFile');

        assert.isString(RejectionCodes.DocIsNotObject);
        assert.isString(RejectionCodes.DocNotFound);
        assert.isString(RejectionCodes.NotIndexableValue);
        assert.isString(RejectionCodes.DuplicatedIndex);
        assert.isString(RejectionCodes.NotIndexedField);
        assert.isString(RejectionCodes.CollectionNotConnected);
        assert.isString(RejectionCodes.IndexNotConnected);
        assert.isString(RejectionCodes.SequenceNotConnected);
        assert.isString(RejectionCodes.DatabaseDoesntExist);
        assert.isString(RejectionCodes.DatabaseNotValid);
        assert.isString(RejectionCodes.UnknownIndex);
        assert.isString(RejectionCodes.DatabaseNotConnected);
        assert.isString(RejectionCodes.SchemaDoesntApply);
        assert.isString(RejectionCodes.InvalidSchema);
        assert.isString(RejectionCodes.UnknownError);
        assert.isString(RejectionCodes.InvalidDBPath);
        assert.isString(RejectionCodes.NotImplemented);
        assert.isString(RejectionCodes.InvalidJSON);
        assert.isString(RejectionCodes.InvalidJSONString);
        assert.isString(RejectionCodes.InvalidJSONFile);
    });

    it(`builds a simple rejection object`, () => {
        const { Rejection, RejectionCodes } = dfdb;

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
        const { Rejection, RejectionCodes } = dfdb;

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
        const { Rejection, RejectionCodes } = dfdb;
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
