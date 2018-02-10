import { DocsOnFileDB } from './includes/manager.dfdb';

import { BasicConstants, Errors } from './includes/constants.dfdb';

import { Collection } from './includes/collection.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';

export = {
    dfdb: DocsOnFileDB.instance(),
    DocsOnFileDB: DocsOnFileDB.instance(),
    constants: { BasicConstants, Errors },
    types: { DocsOnFileDB, Collection, Connection, Index, Sequence }
};

