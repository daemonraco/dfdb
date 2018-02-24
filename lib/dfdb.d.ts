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
declare const _default: {
    dfdb: DocsOnFileDB;
    DocsOnFileDB: DocsOnFileDB;
    constants: {
        BasicConstants: typeof BasicConstants;
        CollectionTypes: typeof CollectionTypes;
        ConnectionSaveConstants: typeof ConnectionSaveConstants;
        RejectionCodes: typeof RejectionCodes;
    };
    types: {
        Collection: typeof Collection;
        Connection: typeof Connection;
        DocsOnFileDB: typeof DocsOnFileDB;
        Index: typeof Index;
        Rejection: typeof Rejection;
        Sequence: typeof Sequence;
        Tools: typeof Tools;
    };
};
export = _default;
