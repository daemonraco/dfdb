/**
 * @file init.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { Collection } from '../collection/collection.dfdb';
import { Initializer } from './initializer.dfdb';
import { IOpenConnectionInit } from './open-connection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools, IPromiseStep } from '../tools.dfdb';

/**
 * This class holds Connection's specific logic to initialize a database.
 *
 * @class SubLogicInit
 */
export class SubLogicInit extends SubLogic<IOpenConnectionInit> {
    /**
     * This method allows to know if current database connection has an
     * initializer assigned.
     *
     * @method hasInitializer
     * @returns {boolean} Returns TRUE when it has.
     */
    public hasInitializer(): boolean {
        return this._mainObject._manifest.initializer !== null
            && this._mainObject._manifest.initializerMD5 !== null;
    }
    /**
     * This method allows access to current database connection's  assigned
     * initializer.
     *
     * @method initializer
     * @returns {Initializer} Returns a copy of this connection's initializer.
     */
    public initializer(): Initializer {
        let out: Initializer = null;

        if (this._mainObject._manifest.initializer) {
            out = new Initializer();
            out.loadFromJSON(Tools.DeepCopy(this._mainObject._manifest.initializer));
        }

        return out;
    }
    /**
     * This method tries to reapply the initial database structure an recreates
     * does assets that may be missing.
     *
     * @method reinitialize
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    public reinitialize(): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                if (this._mainObject._manifest.initializer) {
                    const specs = new Initializer();
                    specs.loadFromJSON(this._mainObject._manifest.initializer);
                    this.applyInitializer(specs)
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve();
                }
            } else {
                //
                // It should be connected to actually reinitialize.
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
        });
    }
    /**
     * This method changes current initialization specification for this database
     * connection.
     *
     * @method setInitializer
     * @param {Initializer} specs Specifications to be set.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    public setInitializer(specs: Initializer): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                //
                // Is it a valid initialization?
                if (specs.error()) {
                    this._mainObject._subLogicErrors.setLastRejection(specs.lastRejection());
                    reject(this._mainObject.lastRejection());
                } else if (this._mainObject._manifest.initializerMD5 === specs.toMD5()) {
                    //
                    // If it's the same, nothing is done.
                    resolve();
                } else {
                    //
                    // Applying initializations at least once.
                    this.applyInitializer(specs).then(() => {
                        //
                        // Updating manifest with new values.
                        this._mainObject._manifest.initializer = specs.toJSON();
                        this._mainObject._manifest.initializerMD5 = specs.toMD5();

                        this._mainObject.save()
                            .then(resolve)
                            .catch(reject);
                    }).catch(reject);
                }
            } else {
                //
                // It should be connected to actually set initializer.
                this._mainObject._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.DatabaseNotConnected));
                reject(this._mainObject._subLogicErrors.lastRejection());
            }
        });
    }
    //
    // Protected metods.
    /**
     * Applies a initial specification to current database connection.
     *
     * @protected
     * @method applyInitializer
     * @param {Initializer} specs Specifications to apply.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    protected applyInitializer(specs: Initializer): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Default list of steps.
            const steps: IPromiseStep[] = [];
            //
            // Generating steps for each collection.
            specs.collections().forEach((colSpec: any) => {
                //
                // Adding a new step for current collection.
                steps.push({
                    params: colSpec,
                    stepFunction: (paramsCol: any): Promise<any> => {
                        return new Promise<void>((resolveCol: () => void, rejectCol: (err: Rejection) => void) => {
                            //
                            // Trying to access current collection. If it
                            // doesn't exist, it'll be created.
                            this._mainObject.collection(paramsCol.name).then((collection: Collection) => {
                                //
                                // Adding a step for each collection index.
                                paramsCol.indexes.forEach((idxSpec: any) => {
                                    //
                                    // Adding a new step for current
                                    // collection index.
                                    steps.push({
                                        params: { collection, field: idxSpec.field },
                                        stepFunction: (paramsIdx: any): Promise<any> => {
                                            return new Promise<void>((resolveIdx: () => void, rejectIdx: (err: Rejection) => void) => {
                                                //
                                                // If it already has the
                                                // requested index, it's
                                                // ignore, otherwise it's
                                                // created.
                                                if (paramsIdx.collection.hasIndex(paramsIdx.field)) {
                                                    resolveIdx();
                                                } else {
                                                    paramsIdx.collection.addFieldIndex(paramsIdx.field)
                                                        .then(resolveIdx)
                                                        .catch(rejectIdx);
                                                }
                                            });
                                        }
                                    });
                                });
                                //
                                // Adding a step for a schema, if any was
                                // given.
                                if (paramsCol.schema) {
                                    steps.push({
                                        params: { collection, schema: paramsCol.schema },
                                        stepFunction: (paramsSch: any): Promise<any> => {
                                            return paramsSch.collection.setSchema(paramsSch.schema);
                                        }
                                    });
                                }
                                //
                                // Adding a step for each initial document to
                                // insert.
                                paramsCol.data.forEach((doc: any) => {
                                    //
                                    // Adding a new step for current document.
                                    steps.push({
                                        params: { collection, doc },
                                        stepFunction: (paramsDoc: any): Promise<any> => {
                                            return new Promise<void>((resolveDoc: () => void, rejectDoc: (err: Rejection) => void) => {
                                                collection.search(doc).then((results: any[]) => {
                                                    if (results.length > 0) {
                                                        resolveDoc();
                                                    } else {
                                                        collection.insert(doc)
                                                            .then(resolveDoc)
                                                            .catch(rejectDoc);
                                                    }
                                                }).catch(rejectDoc);
                                            });
                                        }
                                    });
                                });
                                //
                                // Next collection.
                                resolveCol();
                            }).catch(rejectCol);
                        });
                    }
                });
            });
            //
            // Running all steps of initialization.
            Tools.ProcessPromiseSteps(steps)
                .then(() => {
                    this._mainObject._manifest.initializer = specs.toJSON();
                    this._mainObject._manifest.initializerMD5 = specs.toMD5();

                    resolve();
                })
                .catch(reject);
        });
    }
}
