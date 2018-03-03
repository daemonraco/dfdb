/**
 * @file manager.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Connection } from './connection/connection.dfdb';
/**
 * Central manager for all connection.
 *
 * @class DocsOnFileDB
 */
export declare class DocsOnFileDB {
    private static _instance;
    protected _connections: {
        [name: string]: Connection;
    };
    /**
     * @constructor
     */
    protected constructor();
    /**
     * Provides access to a database connection. In case the requested database
     * is already connected, it returns the same connection.
     *
     * @method connect
     * @param {string} dbname Name of the database to connect.
     * @param {string} dbpath Directory where the requested database is stored.
     * @param {any} options List of extra options to use when connecting.
     * @returns {Promise<Connection>} Returns a connection as a promise.
     */
    connect(dbname: string, dbpath: string, options?: any): Promise<Connection>;
    /**
     * Provides a way to dispose of an existing database
     *
     * @method dropDatabase
     * @param {string} dbname Name of the database to delete.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {Promise<void>} Returns a promise to indicate when the operation
     * finishes.
     */
    dropDatabase(dbname: string, dbpath: string): Promise<void>;
    /**
     * Ask this manager to forget a tracked connection.
     *
     * @method forgetConnection
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {boolean} Returns TRUE when it was forgotten.
     */
    forgetConnection(dbname: string, dbpath: string): boolean;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this manager.
     */
    toString: () => string;
    /**
     * This class method provides access to this manager's single instance.
     *
     * @static
     * @method Instance
     * @returns {DocsOnFileDB} Singleton's instance.
     */
    static Instance(): DocsOnFileDB;
    /**
     * Takes basic identifiers of a database and builds a key for indexation.
     *
     * @static
     * @method BuildKey
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {string}
     */
    protected static BuildKey(dbname: string, dbpath: string): string;
    /**
     * Takes basic identifiers of a database and guesses its full path.
     *
     * @static
     * @method GuessDatabasePath
     * @param {string} dbname Name of the database.
     * @param {string} dbpath Directory where the requested database is stored.
     * @returns {string}
     */
    static GuessDatabasePath(dbname: string, dbpath: string): string;
}
