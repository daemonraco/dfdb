"use strict";
const manager_dfdb_1 = require("./includes/manager.dfdb");
const constants_dfdb_1 = require("./includes/constants.dfdb");
const collection_dfdb_1 = require("./includes/collection.dfdb");
const connection_dfdb_1 = require("./includes/connection.dfdb");
const index_dfdb_1 = require("./includes/index.dfdb");
const sequence_dfdb_1 = require("./includes/sequence.dfdb");
module.exports = {
    dfdb: manager_dfdb_1.DocsOnFileDB.instance(),
    DocsOnFileDB: manager_dfdb_1.DocsOnFileDB.instance(),
    constants: { BasicConstants: constants_dfdb_1.BasicConstants, ConnectionSaveConstants: constants_dfdb_1.ConnectionSaveConstants, Errors: constants_dfdb_1.Errors },
    types: { DocsOnFileDB: manager_dfdb_1.DocsOnFileDB, Collection: collection_dfdb_1.Collection, Connection: connection_dfdb_1.Connection, Index: index_dfdb_1.Index, Sequence: sequence_dfdb_1.Sequence }
};
