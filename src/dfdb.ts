import { DocsOnFileDB } from './includes/manager.dfdb';
import { BasicConstants, Errors } from './includes/constants.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';
import { Table } from './includes/table.dfdb';

export = {
    dfdb: DocsOnFileDB.instance(),
    DocsOnFileDB: DocsOnFileDB.instance(),
    types: { DocsOnFileDB, Connection, Index, Sequence, Table },
    constants: { BasicConstants, Errors }
};

