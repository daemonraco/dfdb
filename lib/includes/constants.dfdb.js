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
