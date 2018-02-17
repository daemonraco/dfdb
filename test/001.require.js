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
        assert.property(dfdb.types, 'Sequence');
        assert.property(dfdb.types, 'Tools');
    });

    it(`loads a proper list of constant lists`, () => {
        assert.typeOf(dfdb.constants, 'object');

        assert.property(dfdb.constants, 'BasicConstants');
        assert.property(dfdb.constants, 'CollectionTypes');
        assert.property(dfdb.constants, 'ConnectionSaveConstants');
        assert.property(dfdb.constants, 'Errors');
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
        //assert.typeOf(dfdb.constants.Errors, 'object');

        assert.property(dfdb.constants.Errors, 'DocIsNotObject');
        assert.property(dfdb.constants.Errors, 'DocNotFound');
        assert.property(dfdb.constants.Errors, 'NotIndexableValue');
        assert.property(dfdb.constants.Errors, 'DuplicatedIndex');
        assert.property(dfdb.constants.Errors, 'NotIndexedField');
        assert.property(dfdb.constants.Errors, 'CollectionNotConnected');
        assert.property(dfdb.constants.Errors, 'IndexNotConnected');
        assert.property(dfdb.constants.Errors, 'SequenceNotConnected');
        assert.property(dfdb.constants.Errors, 'DatabaseDoesntExist');
        assert.property(dfdb.constants.Errors, 'DatabaseNotValid');
        assert.property(dfdb.constants.Errors, 'UnknownIndex');
        assert.property(dfdb.constants.Errors, 'DatabaseNotConnected');

        assert.isString(dfdb.constants.Errors.DocIsNotObject);
        assert.isString(dfdb.constants.Errors.DocNotFound);
        assert.isString(dfdb.constants.Errors.NotIndexableValue);
        assert.isString(dfdb.constants.Errors.DuplicatedIndex);
        assert.isString(dfdb.constants.Errors.NotIndexedField);
        assert.isString(dfdb.constants.Errors.CollectionNotConnected);
        assert.isString(dfdb.constants.Errors.IndexNotConnected);
        assert.isString(dfdb.constants.Errors.SequenceNotConnected);
        assert.isString(dfdb.constants.Errors.DatabaseDoesntExist);
        assert.isString(dfdb.constants.Errors.DatabaseNotValid);
        assert.isString(dfdb.constants.Errors.UnknownIndex);
        assert.isString(dfdb.constants.Errors.DatabaseNotConnected);
    });
});
