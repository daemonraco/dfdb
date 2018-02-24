/**
 * @file schema.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { IOpenCollectionSchema } from './open-collection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
export declare class SubLogicSchema extends SubLogic<IOpenCollectionSchema> {
    /**
     * Checks if this collection has a schema defined for its documents.
     *
     * @method hasSchema
     * @returns {boolean} Returns TRUE when it has a schema defined.
     */
    hasSchema(): boolean;
    /**
     * This method loads internal schema validation objects.
     *
     * @method loadSchemaHandlers
     */
    loadSchemaHandlers(): void;
    /**
     * This method removes a the assigned schema for document validaton on this
     * collection.
     *
     * @method removeSchema
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    removeSchema(): Promise<void>;
    /**
     * Provides a copy of the assigned schema for document validaton.
     *
     * @method removeSchema
     * @returns {any} Return a deep-copy of current collection's schema.
     */
    schema(): any;
    /**
     * Assignes or replaces the schema for document validaton on this collection.
     *
     * @method setSchema
     * @param {any} schema Schema to be assigned.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    setSchema(schema: any): Promise<void>;
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
    protected applySchema(params: {
        [name: string]: any;
    }): Promise<void>;
}
