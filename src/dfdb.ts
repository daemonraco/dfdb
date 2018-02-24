/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */

import { DocsOnFileDB } from './includes/manager.dfdb';

import { BasicConstants, CollectionTypes, ConnectionSaveConstants } from './includes/constants.dfdb';

import { Collection } from './includes/collection/collection.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Rejection } from './includes/rejection.dfdb';
import { RejectionCodes } from './includes/rejection-codes.dfdb';
import { Sequence } from './includes/sequence.dfdb';
import { Tools } from './includes/tools.dfdb';

export = {
    dfdb: DocsOnFileDB.Instance(),
    DocsOnFileDB: DocsOnFileDB.Instance(),
    constants: { BasicConstants, CollectionTypes, ConnectionSaveConstants, RejectionCodes },
    types: { Collection, Connection, DocsOnFileDB, Index, Rejection, Sequence, Tools }
};
