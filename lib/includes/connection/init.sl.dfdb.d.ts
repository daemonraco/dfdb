/**
 * @file init.sl.dfdb.ts
 * @author Alejandro D. Simi
 */
import { Promise } from 'es6-promise';
import { Initializer } from './initializer.dfdb';
import { IOpenConnectionInit } from './open-connection.i.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
/**
 * This class holds Connection's specific logic to initialize a database.
 *
 * @class SubLogicInit
 */
export declare class SubLogicInit extends SubLogic<IOpenConnectionInit> {
    /**
     * This method tries to reapply the initial database structure an recreates
     * does assets that may be missing.
     *
     * @method reinitialize
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    reinitialize(): Promise<void>;
    /**
     * This method changes current initialization specification for this database
     * connection.
     *
     * @method setInitializer
     * @param {Initializer} specs Specifications to be set.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    setInitializer(specs: Initializer): Promise<void>;
    /**
     * Applies a initial specification to current database connection.
     *
     * @protected
     * @method applyInitializer
     * @param {Initializer} specs Specifications to apply.
     * @returns {Promise<void>} Returns a promise that gets resolved when this
     * operation is finished.
     */
    protected applyInitializer(specs: Initializer): Promise<void>;
}
