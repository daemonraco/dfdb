"use strict";
/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
class BasicConstants {
    constructor() { }
}
BasicConstants.DBExtension = '.dfdb';
BasicConstants.DefaultSequence = '_id';
exports.BasicConstants = BasicConstants;
class ConnectionSaveConstants {
    constructor() { }
}
ConnectionSaveConstants.LoadFile = 'load-file';
ConnectionSaveConstants.RemoveFile = 'remove-file';
ConnectionSaveConstants.UpdateFile = 'update-file';
exports.ConnectionSaveConstants = ConnectionSaveConstants;
class Errors {
    constructor() { }
}
Errors.DocIsNotObject = '[E-0001] Given document is not an object';
Errors.DocNotFound = '[E-0002] The requested document does not exist';
Errors.NotIndexableValue = '[E-0003] Given value can not be indexed';
Errors.DuplicatedIndex = '[E-0004] Index already present';
Errors.NotIndexedField = '[E-0005] Field of searched value has no associated index';
Errors.CollectionNotConnected = '[E-0006] Collection not connected';
Errors.IndexNotConnected = '[E-0007] Index not connected';
Errors.SequenceNotConnected = '[E-0008] Sequence not connected';
Errors.DatabaseDoesntExist = `[E-0009] Requested database doesn't exist`;
Errors.DatabaseNotValid = `[E-0010] Requested database is not valid`;
Errors.UnknownIndex = `[E-0011] Requested index is not present on current collection`;
exports.Errors = Errors;
