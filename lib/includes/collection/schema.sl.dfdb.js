"use strict";
/**
 * @file schema.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const es6_promise_1 = require("es6-promise");
const Ajv = require("ajv");
const md5 = require("md5");
const collection_dfdb_1 = require("./collection.dfdb");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const sub_logic_dfdb_1 = require("../sub-logic.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class holds Collection's logic related to its schema.
 *
 * @class SubLogicSchema
 */
class SubLogicSchema extends sub_logic_dfdb_1.SubLogic {
    //
    // Public methods.
    /**
     * Checks if this collection has a schema defined for its documents.
     *
     * @method hasSchema
     * @returns {boolean} Returns TRUE when it has a schema defined.
     */
    hasSchema() {
        return this._mainObject._manifest.schema !== null;
    }
    /**
     * This method loads internal schema validation objects.
     *
     * @method loadSchemaHandlers
     */
    loadSchemaHandlers() {
        //
        // Is it connected and does it have a schema?
        if (this._mainObject._connected && this.hasSchema()) {
            //
            // Creating a simple validator.
            let auxAjv = new Ajv();
            this._mainObject._schemaValidator = auxAjv.compile(this._mainObject._manifest.schema);
            //
            // Creating a validator to add default values.
            auxAjv = new Ajv({
                useDefaults: true
            });
            this._mainObject._schemaApplier = auxAjv.compile(this._mainObject._manifest.schema);
        }
    }
    /**
     * This method removes a the assigned schema for document validaton on this
     * collection.
     *
     * @method removeSchema
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeSchema() {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                //
                // Does it have a schema?
                if (this.hasSchema()) {
                    //
                    // Cleaning schema.
                    this._mainObject._manifest.schema = null;
                    this._mainObject._manifest.schemaMD5 = null;
                    //
                    // Cleaning internal schema validation objects.
                    this._mainObject._schemaValidator = null;
                    this._mainObject._schemaApplier = null;
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
                this._mainObject.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * Provides a copy of the assigned schema for document validaton.
     *
     * @method removeSchema
     * @returns {any} Return a deep-copy of current collection's schema.
     */
    schema() {
        return tools_dfdb_1.Tools.DeepCopy(this._mainObject._manifest.schema);
    }
    /**
     * Assignes or replaces the schema for document validaton on this collection.
     *
     * @method setSchema
     * @param {any} schema Schema to be assigned.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    setSchema(schema) {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Is it connected?
            if (this._mainObject._connected) {
                const schemaAsString = JSON.stringify(schema);
                const schemaMD5 = md5(schemaAsString);
                //
                // Is it a new one?
                if (schemaMD5 !== this._mainObject._manifest.schemaMD5) {
                    //
                    // Checking schema.
                    let valid = false;
                    let ajv = new Ajv();
                    try {
                        let validator = ajv.compile(schema);
                        valid = true;
                    }
                    catch (e) {
                        this._mainObject.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.InvalidSchema, `'\$${ajv.errors[0].dataPath}' ${ajv.errors[0].message}`));
                    }
                    //
                    // Is it valid?
                    if (valid) {
                        //
                        // Building a list of loading asynchronous operations to perform.
                        let steps = [];
                        steps.push({ params: { schema, schemaMD5 }, stepFunction: (params) => this.applySchema(params) });
                        steps.push({ params: {}, stepFunction: (params) => this._mainObject._subLogicIndex.rebuildAllIndexes(params) });
                        //
                        // Loading everything.
                        collection_dfdb_1.Collection.ProcessStepsSequence(steps)
                            .then(() => {
                            this._mainObject.save()
                                .then(resolve)
                                .catch(reject);
                        }).catch(reject);
                    }
                    else {
                        reject(this._mainObject._lastRejection);
                    }
                }
                else {
                    //
                    // If it's not a new one, nothing is done.
                    resolve();
                }
            }
            else {
                this._mainObject.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    //
    // Protected methods.
    /**
     * This method validates and replaces this collection's schema for document
     * validation.
     *
     * @protected
     * @method applySchema
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('schema', 'schemaMD5').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    applySchema(params) {
        //
        // Parsing parameters.
        const { schema, schemaMD5 } = params;
        //
        // Building promise to return.
        return new es6_promise_1.Promise((resolve, reject) => {
            //
            // Creating a few temporary validators.
            let auxAjv = new Ajv();
            let validator = auxAjv.compile(schema);
            //
            // Checking current data against schema.
            Object.keys(this._mainObject._data).forEach((id) => {
                if (!this._mainObject.error()) {
                    if (!validator(this._mainObject._data[id])) {
                        this._mainObject.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.SchemaDoesntApply, `Id: ${id}. '\$${validator.errors[0].dataPath}' ${validator.errors[0].message}`));
                    }
                }
            });
            //
            // Can it be applied.
            if (!this._mainObject.error()) {
                //
                // Updating manifest.
                this._mainObject._manifest.schema = schema;
                this._mainObject._manifest.schemaMD5 = schemaMD5;
                //
                // Reloading schema validators.
                this.loadSchemaHandlers();
                //
                // Fixing current data using the new schema.
                Object.keys(this._mainObject._data).forEach((id) => {
                    this._mainObject._schemaApplier(this._mainObject._data[id]);
                });
                resolve();
            }
            else {
                reject(this._mainObject._lastRejection);
            }
        });
    }
}
exports.SubLogicSchema = SubLogicSchema;
