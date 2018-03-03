"use strict";
/**
 * @file init.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const initializer_dfdb_1 = require("./initializer.dfdb");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Connection's specific logic to initialize a database.
 *
 * @class SubLogicInit
 */
class SubLogicInit extends sub_logic_dfdb_1.SubLogic {
    /**
     * This method allows to know if current database connection has an
     * initializer assigned.
     *
     * @method hasInitializer
     * @returns {boolean} Returns TRUE when it has.
     */
    hasInitializer() {
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
    initializer() {
        let out = null;
        if (this._mainObject._manifest.initializer) {
            out = new initializer_dfdb_1.Initializer();
            out.loadFromJSON(tools_dfdb_1.Tools.DeepCopy(this._mainObject._manifest.initializer));
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
    reinitialize() {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                if (this._mainObject._manifest.initializer) {
                    const specs = new initializer_dfdb_1.Initializer();
                    specs.loadFromJSON(this._mainObject._manifest.initializer);
                    this.applyInitializer(specs)
                        .then(resolve)
                        .catch(reject);
                }
                else {
                    resolve();
                }
            }
            else {
                //
                // It should be connected to actually reinitialize.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
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
    setInitializer(specs) {
        //
        // Restarting error messages.
        this._mainObject._subLogicErrors.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // is it connected?
            if (this._mainObject._connected) {
                //
                // Is it a valid initialization?
                if (specs.error()) {
                    this._mainObject._subLogicErrors.setLastRejection(specs.lastRejection());
                    reject(this._mainObject.lastRejection());
                }
                else if (this._mainObject._manifest.initializerMD5 === specs.toMD5()) {
                    //
                    // If it's the same, nothing is done.
                    resolve();
                }
                else {
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
            }
            else {
                //
                // It should be connected to actually set initializer.
                this._mainObject._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.DatabaseNotConnected));
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
    applyInitializer(specs) {
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Default list of steps.
            const steps = [];
            //
            // Generating steps for each collection.
            specs.collections().forEach((colSpec) => {
                //
                // Adding a new step for current collection.
                steps.push({
                    params: colSpec,
                    stepFunction: (paramsCol) => {
                        return new es6_promise_1.Promise((resolveCol, rejectCol) => {
                            //
                            // Trying to access current collection. If it
                            // doesn't exist, it'll be created.
                            this._mainObject.collection(paramsCol.name).then((collection) => {
                                //
                                // Adding a step for each collection index.
                                paramsCol.indexes.forEach((idxSpec) => {
                                    //
                                    // Adding a new step for current
                                    // collection index.
                                    steps.push({
                                        params: { collection, field: idxSpec.field },
                                        stepFunction: (paramsIdx) => {
                                            return new es6_promise_1.Promise((resolveIdx, rejectIdx) => {
                                                //
                                                // If it already has the
                                                // requested index, it's
                                                // ignore, otherwise it's
                                                // created.
                                                if (paramsIdx.collection.hasIndex(paramsIdx.field)) {
                                                    resolveIdx();
                                                }
                                                else {
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
                                        stepFunction: (paramsSch) => {
                                            return paramsSch.collection.setSchema(paramsSch.schema);
                                        }
                                    });
                                }
                                //
                                // Adding a step for each initial document to
                                // insert.
                                paramsCol.data.forEach((doc) => {
                                    //
                                    // Adding a new step for current document.
                                    steps.push({
                                        params: { collection, doc },
                                        stepFunction: (paramsDoc) => {
                                            return new es6_promise_1.Promise((resolveDoc, rejectDoc) => {
                                                collection.search(doc).then((results) => {
                                                    if (results.length > 0) {
                                                        resolveDoc();
                                                    }
                                                    else {
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
            tools_dfdb_1.Tools.ProcessPromiseSteps(steps)
                .then(() => {
                this._mainObject._manifest.initializer = specs.toJSON();
                this._mainObject._manifest.initializerMD5 = specs.toMD5();
                resolve();
            })
                .catch(reject);
        });
    }
}
exports.SubLogicInit = SubLogicInit;
