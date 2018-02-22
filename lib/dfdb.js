"use strict";
/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */
const manager_dfdb_1 = require("./includes/manager.dfdb");
const constants_dfdb_1 = require("./includes/constants.dfdb");
const collection_dfdb_1 = require("./includes/collection.dfdb");
const connection_dfdb_1 = require("./includes/connection.dfdb");
const index_dfdb_1 = require("./includes/index.dfdb");
const rejection_dfdb_1 = require("./includes/rejection.dfdb");
const rejection_codes_dfdb_1 = require("./includes/rejection-codes.dfdb");
const sequence_dfdb_1 = require("./includes/sequence.dfdb");
const tools_dfdb_1 = require("./includes/tools.dfdb");
module.exports = {
    dfdb: manager_dfdb_1.DocsOnFileDB.Instance(),
    DocsOnFileDB: manager_dfdb_1.DocsOnFileDB.Instance(),
    constants: { BasicConstants: constants_dfdb_1.BasicConstants, CollectionTypes: constants_dfdb_1.CollectionTypes, ConnectionSaveConstants: constants_dfdb_1.ConnectionSaveConstants, RejectionCodes: rejection_codes_dfdb_1.RejectionCodes },
    types: { Collection: collection_dfdb_1.Collection, Connection: connection_dfdb_1.Connection, DocsOnFileDB: manager_dfdb_1.DocsOnFileDB, Index: index_dfdb_1.Index, Rejection: rejection_dfdb_1.Rejection, Sequence: sequence_dfdb_1.Sequence, Tools: tools_dfdb_1.Tools }
};
