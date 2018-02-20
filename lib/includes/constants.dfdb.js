"use strict";
/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This basic class provides a set of generic constants used by all DocsOnFileDB
 * assets.
 *
 * @class BasicConstants
 */
class BasicConstants {
    constructor() { }
}
BasicConstants.DBExtension = '.dfdb';
BasicConstants.DefaultSequence = '_id';
exports.BasicConstants = BasicConstants;
/**
 * This class provides a set of constants used to identify the kind of internal
 * logic a collection uses.
 *
 * @class CollectionTypes
 */
class CollectionTypes {
    constructor() { }
}
/** @todo 'CollectionTypes.Heavy' will be implemented on v0.2.0 */
CollectionTypes.Heavy = 'heavy';
CollectionTypes.Simple = 'simple';
exports.CollectionTypes = CollectionTypes;
/**
 * This class provides a specific set of constants used by the connection class to
 * queue operation on the zip file.
 *
 * @class ConnectionSaveConstants
 */
class ConnectionSaveConstants {
    constructor() { }
}
ConnectionSaveConstants.LoadFile = 'load-file';
ConnectionSaveConstants.RemoveFile = 'remove-file';
ConnectionSaveConstants.UpdateFile = 'update-file';
exports.ConnectionSaveConstants = ConnectionSaveConstants;
/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class Errors
 */
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
Errors.DatabaseNotConnected = '[E-0012] Database not connected';
Errors.SchemaDoesntApply = `[E-0013] Document doesn't follow the given schema`;
Errors.InvalidSchema = `[E-0014] Given schema is not valid`;
exports.Errors = Errors;
