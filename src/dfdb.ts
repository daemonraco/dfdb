/**
 * @file dfdb.ts
 * @author Alejandro D. Simi
 */

//
// Exposing main objects.
import { DocsOnFileDB as DocsOnFileDBClass } from './includes/manager.dfdb';
export const dfdb: DocsOnFileDBClass = DocsOnFileDBClass.Instance();
export const DocsOnFileDB: DocsOnFileDBClass = DocsOnFileDBClass.Instance();
export const DFDBGuessDatabasePath = (dbname: string, dbpath: string): string => {
    return DocsOnFileDBClass.GuessDatabasePath(dbname, dbpath);
}

//
// Exposing constants.
export { BasicConstants, CollectionTypes, ConnectionSaveConstants } from './includes/constants.dfdb';
export { RejectionCodes } from './includes/rejection-codes.dfdb';

//
// Exposing types.
export { BasicDictionary, DBDocument, DBDocumentID } from './includes/basic-types.dfdb';
export { Collection } from './includes/collection/collection.dfdb';
export { Connection } from './includes/connection/connection.dfdb';
export { Index } from './includes/index.dfdb';
export { Rejection } from './includes/rejection.dfdb';
export { Sequence } from './includes/sequence.dfdb';
export { Tools } from './includes/tools.dfdb';
