/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */
import { DocsOnFileDB as DocsOnFileDBClass } from './includes/manager.dfdb';
export declare const dfdb: DocsOnFileDBClass;
export declare const DocsOnFileDB: DocsOnFileDBClass;
export declare const DFDBGuessDatabasePath: (dbname: string, dbpath: string) => string;
export { BasicConstants, CollectionTypes, ConnectionSaveConstants } from './includes/constants.dfdb';
export { RejectionCodes } from './includes/rejection-codes.dfdb';
export { BasicDictionary, DBDocument, DBDocumentID } from './includes/basic-types.dfdb';
export { Collection } from './includes/collection/collection.dfdb';
export { Connection } from './includes/connection/connection.dfdb';
export { Index } from './includes/index.dfdb';
export { Rejection } from './includes/rejection.dfdb';
export { Sequence } from './includes/sequence.dfdb';
export { Tools } from './includes/tools.dfdb';
