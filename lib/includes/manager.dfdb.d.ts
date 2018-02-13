/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from './connection.dfdb';
export declare class DocsOnFileDB {
    private static _instance;
    protected _connections: {
        [name: string]: Connection;
    };
    protected constructor();
    connect(dbname: string, dbpath: string, options?: any): Promise<Connection>;
    dropDatabase(dbname: string, dbpath: string): Promise<void>;
    forgetConnection(dbname: string, dbpath: string): boolean;
    static Instance(): DocsOnFileDB;
    protected static BuildKey(dbname: string, dbpath: string): string;
    static GuessDatabasePath(dbName: string, dbPath: string): string;
}
