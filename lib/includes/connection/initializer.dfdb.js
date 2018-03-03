"use strict";
/**
 * @file initializer.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const rejection_dfdb_1 = require("../rejection.dfdb");
const rejection_codes_dfdb_1 = require("../rejection-codes.dfdb");
const errors_sl_dfdb_1 = require("../errors.sl.dfdb");
const initializer_schema_dfdb_1 = require("./initializer-schema.dfdb");
const tools_dfdb_1 = require("../tools.dfdb");
/**
 * This class represents and manipulates a database initialization structure.
 *
 * @class Initializer
 */
class Initializer {
    //
    // Constructors.
    /**
     * @constructor
     */
    constructor() {
        //
        // Potected properties.
        this._asJSON = null;
        this._asMD5 = null;
        this._collections = [];
        this._loaded = false;
        this._subLogicErrors = null;
        //
        // Sub-logics.
        this._subLogicErrors = new errors_sl_dfdb_1.SubLogicErrors(this);
    }
    //
    // Public methods.
    /**
     * Provides access to a listo of collections that has to be present in a
     * database using this initializer.
     *
     * @returns {any[]} Returns a list of collections.
     */
    collections() {
        return tools_dfdb_1.Tools.DeepCopy(this._collections);
    }
    /**
     * Provides a way to know if there was an error in the last operation.
     *
     * @method error
     * @returns {boolean} Returns TRUE when there was an error.
     */
    error() {
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
    lastError() {
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
    lastRejection() {
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
    loadFromJSON(specs) {
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Obtaining a proper validator.
        const validator = Initializer.JSONValidator();
        //
        // Is the given specification valid?
        if (specs && validator.validate(specs)) {
            //
            // Loading collections.
            this._collections = tools_dfdb_1.Tools.DeepCopy(specs.collections);
            //
            // Starting basic internal properties.
            this.buildAbstractions();
            //
            // At this point, it's considered to be loaded.
            this._loaded = true;
        }
        else {
            this._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.InvalidJSON));
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
    loadFromString(specsStr) {
        //
        // Default values.
        let specs = null;
        //
        // Restarting error messages.
        this._subLogicErrors.resetError();
        //
        // Trying to decode given string.
        try {
            specs = JSON.parse(specsStr);
        }
        catch (error) {
            this._subLogicErrors.setLastRejection(new rejection_dfdb_1.Rejection(rejection_codes_dfdb_1.RejectionCodes.InvalidJSONString, { error }));
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
    toMD5() {
        return this._asMD5;
    }
    /**
     * Provides access to this initializer represented as a JSON.
     *
     * @method toJSON
     * @returns {string} Returns a JSON object.
     */
    toJSON() {
        return tools_dfdb_1.Tools.DeepCopy(this._asJSON);
    }
    //
    // Potected methods.
    /**
     * This method loads basic internal represantations of this initializer.
     *
     * @protected
     * @method buildAbstractions
     */
    buildAbstractions() {
        this._asJSON = tools_dfdb_1.Tools.DeepCopy({
            collections: this._collections
        });
        this._asMD5 = tools_dfdb_1.Tools.ObjectToMD5(this._asJSON);
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
    static JSONValidator() {
        //
        // Does it already have a validator?
        if (Initializer._JSONValidator === null) {
            Initializer._JSONValidator = {
                ajv: new Ajv({
                    useDefaults: true
                })
            };
            Initializer._JSONValidator.validate = Initializer._JSONValidator.ajv.compile(initializer_schema_dfdb_1.default);
        }
        return Initializer._JSONValidator;
    }
}
//
// Potected class properties.
Initializer._JSONValidator = null;
exports.Initializer = Initializer;
