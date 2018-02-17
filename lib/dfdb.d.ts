/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */
import { DocsOnFileDB } from './includes/manager.dfdb';
import { BasicConstants, CollectionTypes, ConnectionSaveConstants, Errors } from './includes/constants.dfdb';
import { Collection } from './includes/collection.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';
import { Tools } from './includes/tools.dfdb';
declare const _default: {
    dfdb: DocsOnFileDB;
    DocsOnFileDB: DocsOnFileDB;
    constants: {
        BasicConstants: typeof BasicConstants;
        CollectionTypes: typeof CollectionTypes;
        ConnectionSaveConstants: typeof ConnectionSaveConstants;
        Errors: typeof Errors;
    };
    types: {
        Collection: typeof Collection;
        Connection: typeof Connection;
        DocsOnFileDB: typeof DocsOnFileDB;
        Index: typeof Index;
        Sequence: typeof Sequence;
        Tools: typeof Tools;
    };
};
export = _default;
