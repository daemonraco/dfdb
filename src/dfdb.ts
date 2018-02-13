/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */

import { DocsOnFileDB } from './includes/manager.dfdb';

import { BasicConstants, ConnectionSaveConstants, Errors } from './includes/constants.dfdb';

import { Collection } from './includes/collection.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';

export = {
    dfdb: DocsOnFileDB.Instance(),
    DocsOnFileDB: DocsOnFileDB.Instance(),
    constants: { BasicConstants, ConnectionSaveConstants, Errors },
    types: { DocsOnFileDB, Collection, Connection, Index, Sequence }
};
