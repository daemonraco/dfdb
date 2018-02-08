"use strict";
const manager_dfdb_1 = require("./includes/manager.dfdb");
const constants_dfdb_1 = require("./includes/constants.dfdb");
const connection_dfdb_1 = require("./includes/connection.dfdb");
const index_dfdb_1 = require("./includes/index.dfdb");
const sequence_dfdb_1 = require("./includes/sequence.dfdb");
const table_dfdb_1 = require("./includes/table.dfdb");
module.exports = {
    dfdb: manager_dfdb_1.DocsOnFileDB.instance(),
    DocsOnFileDB: manager_dfdb_1.DocsOnFileDB.instance(),
    types: { DocsOnFileDB: manager_dfdb_1.DocsOnFileDB, Connection: connection_dfdb_1.Connection, Index: index_dfdb_1.Index, Sequence: sequence_dfdb_1.Sequence, Table: table_dfdb_1.Table },
    constants: { BasicConstants: constants_dfdb_1.BasicConstants, Errors: constants_dfdb_1.Errors }
};
