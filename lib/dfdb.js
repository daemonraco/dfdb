"use strict";
/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
//
// Exposing main objects.
const manager_dfdb_1 = require("./includes/manager.dfdb");
exports.dfdb = manager_dfdb_1.DocsOnFileDB.Instance();
exports.DocsOnFileDB = manager_dfdb_1.DocsOnFileDB.Instance();
exports.DFDBGuessDatabasePath = (dbname, dbpath) => {
    return manager_dfdb_1.DocsOnFileDB.GuessDatabasePath(dbname, dbpath);
};
//
// Exposing constants.
var constants_dfdb_1 = require("./includes/constants.dfdb");
exports.BasicConstants = constants_dfdb_1.BasicConstants;
exports.CollectionTypes = constants_dfdb_1.CollectionTypes;
exports.ConnectionSaveConstants = constants_dfdb_1.ConnectionSaveConstants;
var rejection_codes_dfdb_1 = require("./includes/rejection-codes.dfdb");
exports.RejectionCodes = rejection_codes_dfdb_1.RejectionCodes;
//
// Exposing types.
var collection_dfdb_1 = require("./includes/collection/collection.dfdb");
exports.Collection = collection_dfdb_1.Collection;
var connection_dfdb_1 = require("./includes/connection/connection.dfdb");
exports.Connection = connection_dfdb_1.Connection;
var index_dfdb_1 = require("./includes/index.dfdb");
exports.Index = index_dfdb_1.Index;
var rejection_dfdb_1 = require("./includes/rejection.dfdb");
exports.Rejection = rejection_dfdb_1.Rejection;
var sequence_dfdb_1 = require("./includes/sequence.dfdb");
exports.Sequence = sequence_dfdb_1.Sequence;
var tools_dfdb_1 = require("./includes/tools.dfdb");
exports.Tools = tools_dfdb_1.Tools;
