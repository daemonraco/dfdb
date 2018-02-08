/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Connection } from './connection.dfdb';
export declare class DocsOnFileDB {
    private static _instance;
    protected connections: {
        [name: string]: Connection;
    };
    protected constructor();
    connect(dbname: string, dbpath: string, options?: any, done?: any): void;
    static instance(): DocsOnFileDB;
}
