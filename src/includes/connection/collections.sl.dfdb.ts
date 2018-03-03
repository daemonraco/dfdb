/**
 * @file collections.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { CollectionTypes } from '../constants.dfdb';
import { Collection } from '../collection/collection.dfdb';
import { ConnectionDBValidationResult, ConnectionSavingQueueResult } from './types.dfdb';
import { IOpenConnectionCollections } from './open-connection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools } from '../tools.dfdb';

export class SubLogicCollections extends SubLogic<IOpenConnectionCollections> {
    /**
     * Provides access to a collection inside current database connection. If such
     * collection doesn't exist, it is created.
     *
     * @method collection
     * @param {string} name Collection to look for.
     * @returns {Promise<Collection>} Returns a connection as a promise.
     */
    public collection(name: string): Promise<Collection> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<Collection>((resolve: (res: Collection) => void, reject: (err: Rejection) => void) => {
            //
            // Is it a known collection?
            if (typeof this._mainObject._collections[name] !== 'undefined') {
                //
                // Resolving from cache.
                resolve(this._mainObject._collections[name]);
            } else {
                //
                // Anonymous function to actually handle the collection loading.
                const loadCollection = () => {
                    //
                    // Creating a proper collection object.
                    this._mainObject._collections[name] = new Collection(name, <any>this._mainObject);
                    //
                    // Starting collection connector.
                    this._mainObject._collections[name].connect()
                        .then(() => {
                            resolve(this._mainObject._collections[name]);
                        })
                        .catch(reject);
                };
                //
                // Is it a known collection?
                if (typeof this._mainObject._manifest.collections[name] === 'undefined') {
                    //
                    // Adding it as known.
                    this._mainObject._manifest.collections[name] = {
                        name,
                        type: CollectionTypes.Simple
                    };
                    //
                    // Saving changes before loading.
                    this._mainObject.save()
                        .then(loadCollection)
                        .catch(reject);
                } else {
                    //
                    // If it's known, it's get immediately loaded.
                    loadCollection();
                }
            }
        });
    }
    /**
     * Provides access to the list of collection this connections knows.
     *
     * @method collections
     * @returns {{ [name: string]: any }} Returns a list of collections this connection knows.
     */
    public collections(): { [name: string]: any } {
        //
        // Returning a deep-copy to avoid unintentional changes.
        return Tools.DeepCopy(this._mainObject._manifest.collections);
    }
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
    public forgetCollection(name: string, drop: boolean = false): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it tracked?
            if (typeof this._mainObject._collections[name] !== 'undefined') {
                //
                // Forgetting.
                delete this._mainObject._collections[name];
                //
                // Should it completelly forget it?
                if (drop) {
                    //
                    // Forgetting.
                    delete this._mainObject._manifest.collections[name];
                    //
                    // Saving changes.
                    this._mainObject.save()
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve();
                }
            } else {
                //
                // If it's not tracked, nothing is done.
                resolve();
            }
        });
    }
    /**
     * Provides a way to know if this connection stores certain collection.
     *
     * @method hasCollection
     * @param {string} name Name of the collection to check.
     * @returns {boolean} Returns TRUE when it does.
     */
    public hasCollection(name: string): boolean {
        return typeof this._mainObject._manifest.collections[name] !== 'undefined';
    }
}