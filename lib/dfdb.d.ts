import { DocsOnFileDB } from './includes/manager.dfdb';
import { BasicConstants, Errors } from './includes/constants.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';
import { Table } from './includes/table.dfdb';
declare const _default: {
    dfdb: DocsOnFileDB;
    DocsOnFileDB: DocsOnFileDB;
    types: {
        DocsOnFileDB: typeof DocsOnFileDB;
        Connection: typeof Connection;
        Index: typeof Index;
        Sequence: typeof Sequence;
        Table: typeof Table;
    };
    constants: {
        BasicConstants: typeof BasicConstants;
        Errors: typeof Errors;
    };
};
export = _default;
