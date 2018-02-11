/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Connection } from './connection.dfdb';
export declare class DocsOnFileDB {
    private static _instance;
    protected _connections: {
        [name: string]: Connection;
    };
    protected constructor();
    connect(dbname: string, dbpath: string, options?: any, done?: any): void;
    dropDatabase(dbname: string, dbpath: string, done?: any): void;
    forgetConnection(dbname: string, dbpath: string): boolean;
    static Instance(): DocsOnFileDB;
    protected static BuildKey(dbname: string, dbpath: string): string;
    static GuessDatabasePath(dbName: string, dbPath: string): string;
}
