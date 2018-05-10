/**
 * @file collections.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { BasicDictionary } from '../basic-types.dfdb';
import { Collection } from '../collection/collection.dfdb';
import { IOpenConnectionCollections } from './open-connection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Connection's specific logic to manpulate a database
 * collections.
 *
 * @class SubLogicCollections
 */
export declare class SubLogicCollections extends SubLogic<IOpenConnectionCollections> {
    /**
     * Provides access to a collection inside current database connection. If such
     * collection doesn't exist, it is created.
     *
     * @method collection
     * @param {string} name Collection to look for.
     * @returns {Promise<Collection>} Returns a connection as a promise.
     */
    collection(name: string): Promise<Collection>;
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {BasicDictionary} Returns a list of collections this connection
     * knows.
     */
    collections(): BasicDictionary;
    /**
     * Ask this connection to forget a tracked collection.
     *
     * @method forgetCollection
     * @param {string} name Collection name.
     * @param {boolean} drop Forgetting a collection is simple assuming that it's
     * not loaded, but it will still have an entry in the manifest. This parameter
     * forces this connection to completelly forget it.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    forgetCollection(name: string, drop?: boolean): Promise<void>;
    /**
     * Provides a way to know if this connection stores certain collection.
     *
     * @method hasCollection
     * @param {string} name Name of the collection to check.
     * @returns {boolean} Returns TRUE when it does.
     */
    hasCollection(name: string): boolean;
}
