/**
 * @file schema.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';
import * as Ajv from 'ajv';
import * as md5 from 'md5';

import { Collection } from './collection.dfdb';
import { ICollectionStep } from './collection-step.i.dfdb';
import { IOpenCollectionSchema } from './open-collection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools } from '../tools.dfdb';

/**
 * This class holds Collection's logic related to its schema.
 *
 * @class SubLogicSchema
 */
export class SubLogicSchema extends SubLogic<IOpenCollectionSchema> {
    //
    // Public methods.
    /**
     * Checks if this collection has a schema defined for its documents.
     *
     * @method hasSchema
     * @returns {boolean} Returns TRUE when it has a schema defined.
     */
    public hasSchema(): boolean {
        return this._mainObject._manifest.schema !== null;
    }
    /**
     * This method loads internal schema validation objects.
     *
     * @method loadSchemaHandlers
     */
    public loadSchemaHandlers(): void {
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
    public removeSchema(): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                } else {
                    resolve();
                }
            } else {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
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
    public schema(): any {
        return Tools.DeepCopy(this._mainObject._manifest.schema);
    }
    /**
     * Assignes or replaces the schema for document validaton on this collection.
     *
     * @method setSchema
     * @param {any} schema Schema to be assigned.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public setSchema(schema: any): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
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
                    } catch (e) {
                        this._mainObject.setLastRejection(new Rejection(RejectionCodes.InvalidSchema, `'\$${ajv.errors[0].dataPath}' ${ajv.errors[0].message}`));
                    }
                    //
                    // Is it valid?
                    if (valid) {
                        //
                        // Building a list of loading asynchronous operations to perform.
                        let steps: ICollectionStep[] = [];
                        steps.push({ params: { schema, schemaMD5 }, stepFunction: (params: any) => this.applySchema(params) });
                        steps.push({ params: {}, stepFunction: (params: any) => this._mainObject._subLogicIndex.rebuildAllIndexes(params) });
                        //
                        // Loading everything.
                        Collection.ProcessStepsSequence(steps)
                            .then(() => {
                                this._mainObject.save()
                                    .then(resolve)
                                    .catch(reject);
                            }).catch(reject);
                    } else {
                        reject(this._mainObject._lastRejection);
                    }
                } else {
                    //
                    // If it's not a new one, nothing is done.
                    resolve();
                }
            } else {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
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
    protected applySchema(params: { [name: string]: any }): Promise<void> {
        //
        // Parsing parameters.
        const { schema, schemaMD5 } = params;
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Creating a few temporary validators.
            let auxAjv = new Ajv();
            let validator = auxAjv.compile(schema);
            //
            // Checking current data against schema.
            Object.keys(this._mainObject._data).forEach((id: string) => {
                if (!this._mainObject.error()) {
                    if (!validator(this._mainObject._data[id])) {
                        this._mainObject.setLastRejection(new Rejection(RejectionCodes.SchemaDoesntApply, `Id: ${id}. '\$${validator.errors[0].dataPath}' ${validator.errors[0].message}`));
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
                Object.keys(this._mainObject._data).forEach((id: string) => {
                    this._mainObject._schemaApplier(this._mainObject._data[id]);
                });

                resolve();
            } else {
                reject(this._mainObject._lastRejection);
            }
        });
    }
}