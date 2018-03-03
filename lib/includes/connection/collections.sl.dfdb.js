"use strict";
/**
 * @file collections.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const constants_dfdb_1 = require("../constants.dfdb");
const collection_dfdb_1 = require("../collection/collection.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Connection's specific logic to manpulate a database
 * collections.
 *
 * @class SubLogicCollections
 */
class SubLogicCollections extends sub_logic_dfdb_1.SubLogic {
    /**
     * Provides access to a collection inside current database connection. If such
     * collection doesn't exist, it is created.
     *
     * @method collection
     * @param {string} name Collection to look for.
     * @returns {Promise<Collection>} Returns a connection as a promise.
     */
    collection(name) {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it a known collection?
            if (typeof this._mainObject._collections[name] !== 'undefined') {
                //
                // Resolving from cache.
                resolve(this._mainObject._collections[name]);
            }
            else {
                //
                // Anonymous function to actually handle the collection loading.
                const loadCollection = () => {
                    //
                    // Creating a proper collection object.
                    this._mainObject._collections[name] = new collection_dfdb_1.Collection(name, this._mainObject);
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
                        type: constants_dfdb_1.CollectionTypes.Simple
                    };
                    //
                    // Saving changes before loading.
                    this._mainObject.save()
                        .then(loadCollection)
                        .catch(reject);
                }
                else {
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
    collections() {
        //
        // Returning a deep-copy to avoid unintentional changes.
        return tools_dfdb_1.Tools.DeepCopy(this._mainObject._manifest.collections);
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
    forgetCollection(name, drop = false) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
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
                }
                else {
                    resolve();
                }
            }
            else {
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
    hasCollection(name) {
        return typeof this._mainObject._manifest.collections[name] !== 'undefined';
    }
}
exports.SubLogicCollections = SubLogicCollections;
