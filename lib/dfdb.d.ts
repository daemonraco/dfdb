import { DocsOnFileDB } from './includes/manager.dfdb';
import { BasicConstants, Errors } from './includes/constants.dfdb';
import { Collection } from './includes/collection.dfdb';
import { Connection } from './includes/connection.dfdb';
import { Index } from './includes/index.dfdb';
import { Sequence } from './includes/sequence.dfdb';
declare const _default: {
    dfdb: DocsOnFileDB;
    DocsOnFileDB: DocsOnFileDB;
    constants: {
        BasicConstants: typeof BasicConstants;
        Errors: typeof Errors;
    };
    types: {
        DocsOnFileDB: typeof DocsOnFileDB;
        Collection: typeof Collection;
        Connection: typeof Connection;
        Index: typeof Index;
        Sequence: typeof Sequence;
    };
};
export = _default;
