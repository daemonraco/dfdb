/**
 * @file basic-types.dfdb.ts
 * @author Alejandro D. Simi
 */

export type BasicDictionary = { [key: string]: any };

export interface DBDocument {
    _id: DBDocumentID;
    _created: Date;
    _updated: Date;
    [key: string]: any;
}

export type DBDocumentID = string;
