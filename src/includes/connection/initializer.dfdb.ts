/**
 * @file initializer.dfdb.ts
 * @author Alejandro D. Simi
 */

import * as Ajv from 'ajv';

import { IErrors } from '../errors.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogicErrors } from '../errors.sl.dfdb';
import { Collection } from '../collection/collection.dfdb';
import { default as InitializerSchema } from './initializer-schema.dfdb';
import { Tools } from '../tools.dfdb';

/**
 * This class represents and manipulates a database initialization structure.
 *
 * @class Initializer
 */
export class Initializer implements IErrors {
    //
    // Potected class properties.
    protected static _JSONValidator: any = null;
    //
    // Potected properties.
    protected _asJSON: any = null;
    protected _asMD5: string = null;
    protected _collections: any[] = [];
    protected _loaded: boolean = false;
    protected _subLogicErrors: SubLogicErrors<Initializer> = null;
    //
    // Constructors.
    /**
     * @constructor
     */
    public constructor() {
        //
        // Sub-logics.
        this._subLogicErrors = new SubLogicErrors<Initializer>(this);
    }
    //
    // Public methods.
    /**
     * Provides access to a listo of collections that has to be present in a
     * database using this initializer.
     *
     * @returns {any[]} Returns a list of collections.
     */
    public collections(): any[] {
        return Tools.DeepCopy(this._collections);
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    public error(): boolean {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.error();
    }
    /**
     * Provides access to the error message registed by the last operation.
     *
     * @method lastError
     * @returns {string|null} Returns an error message.
     */
    public lastError(): string | null {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastError();
    }
    /**
     * Provides access to the rejection registed by the last operation.
     *
     * @method lastRejection
     * @returns {Rejection} Returns an rejection object.
     */
    public lastRejection(): Rejection {
        //
        // Forwarding to sub-logic.
        return this._subLogicErrors.lastRejection();
    }
    /**
     * This method loads this initializer based on a JSON.
     *
     * @method loadFromJSON
     * @param {any} specs Specifications to load.
     * @returns {boolean} Returns TRUE when it successfully loaded.
     */
    public loadFromJSON(specs: any): boolean {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Obtaining a proper validator.
        const validator: any = Initializer.JSONValidator();
        //
        // Is the given specification valid?
        if (specs && validator.validate(specs)) {
            //
            // Loading collections.
            this._collections = Tools.DeepCopy(specs.collections);
            //
            // Starting basic internal properties.
            this.buildAbstractions();
            //
            // At this point, it's considered to be loaded.
            this._loaded = true;
        } else {
            this._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.InvalidJSON));
        }

        return this._loaded;
    }
    /**
     * This method loads this initializer based on a string.
     *
     * @method loadFromJSON
     * @param {string} specsStr Specifications to load.
     * @returns {boolean} Returns TRUE when it successfully loaded.
     */
    public loadFromString(specsStr: string): boolean {
        //
        // Default values.
        let specs: any = null;
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Trying to decode given string.
        try {
            specs = JSON.parse(specsStr);
        } catch (error) {
            this._subLogicErrors.setLastRejection(new Rejection(RejectionCodes.InvalidJSONString, { error }));
        }
        //
        // Forwarding loading.
        return !this._subLogicErrors.error() ? this.loadFromJSON(specs) : false;
    }
    /**
     * Provides access to this initializer represented as a MD5 hash.
     *
     * @method toMD5
     * @returns {string} Returns a unique hash code.
     */
    public toMD5(): string {
        return this._asMD5;
    }
    /**
     * Provides access to this initializer represented as a JSON.
     *
     * @method toJSON
     * @returns {string} Returns a JSON object.
     */
    public toJSON(): any {
        return Tools.DeepCopy(this._asJSON);
    }
    //
    // Potected methods.
    /**
     * This method loads basic internal represantations of this initializer.
     *
     * @protected
     * @method buildAbstractions
     */
    protected buildAbstractions(): void {
        this._asJSON = Tools.DeepCopy({
            collections: this._collections
        });
        this._asMD5 = Tools.ObjectToMD5(this._asJSON);
    }
    //
    // Potected class methods.
    /**
     * This method provides access to a single instance of a JSON validator of all
     * initializers.
     *
     * @protected
     * @static
     * @method JSONValidator
     */
    protected static JSONValidator(): any {
        //
        // Does it already have a validator?
        if (Initializer._JSONValidator === null) {
            Initializer._JSONValidator = {
                ajv: new Ajv({
                    useDefaults: true
                })
            };
            Initializer._JSONValidator.validate = Initializer._JSONValidator.ajv.compile(InitializerSchema);
        }

        return Initializer._JSONValidator;
    }
}