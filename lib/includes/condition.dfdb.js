"use strict";
/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * List of known types of conditions.
 * @enum ConditionTypes
 */
var ConditionTypes;
(function (ConditionTypes) {
    ConditionTypes[ConditionTypes["Exact"] = 0] = "Exact";
    ConditionTypes[ConditionTypes["GreaterOrEqual"] = 1] = "GreaterOrEqual";
    ConditionTypes[ConditionTypes["GreaterThan"] = 2] = "GreaterThan";
    ConditionTypes[ConditionTypes["Ignored"] = 3] = "Ignored";
    ConditionTypes[ConditionTypes["In"] = 4] = "In";
    ConditionTypes[ConditionTypes["Like"] = 5] = "Like";
    ConditionTypes[ConditionTypes["LowerOrEqual"] = 6] = "LowerOrEqual";
    ConditionTypes[ConditionTypes["LowerThan"] = 7] = "LowerThan";
    ConditionTypes[ConditionTypes["NotIn"] = 8] = "NotIn";
    ConditionTypes[ConditionTypes["RegEx"] = 9] = "RegEx";
    ConditionTypes[ConditionTypes["Wrong"] = 10] = "Wrong";
})(ConditionTypes = exports.ConditionTypes || (exports.ConditionTypes = {}));
;
/**
 * This class represents all types of search conditions and how they evaluate
 * values.
 *
 * @class Condition
 */
class Condition {
    //
    // Constructors
    /**
     * @protected
     * @constructor
     */
    constructor(conditionType, field, data) {
        //
        // Protected properties.
        this._data = null;
        this._field = null;
        this._type = null;
        this._typeName = null;
        //
        // Public pointer methods.
        /**
         * This point will hold the logic to validate a value when this object
         * completes its contruction.
         *
         * @method validate
         * @param {any} value Value to check.
         * @returns {boolean} Returns TRUE when it checks out.
         */
        this.validate = null;
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this condition.
         */
        this.toString = () => {
            return `condition:${this._field}[${this._typeName}]`;
        };
        //
        // Shortcuts.
        this._type = conditionType;
        this._field = field;
        this._data = data;
        //
        // Setting pointer methods.
        this._typeName = ConditionTypes[this._type];
        this.cleanData = this[`cleanData${this._typeName}`];
        this.validate = this[`validate${this._typeName}`];
        //
        // Cleaning data.
        this.cleanData();
    }
    //
    // Public methods.
    /**
     * Field name to which this condition is associated.
     *
     * @method field
     * @returns {string} Returns a field name.
     */
    field() {
        return this._field;
    }
    //
    // Protected methods.
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * matched exactly in later validations.
     *
     * @protected
     * @method cleanDataExact
     */
    cleanDataExact() {
        this._data = `${this._data['$exact']}`.toLowerCase();
    }
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'greater than or equal' validations.
     *
     * @protected
     * @method cleanDataGreaterOrEqual
     */
    cleanDataGreaterOrEqual() {
        if (Condition.PrimitiveTypes.indexOf(typeof this._data) < 0) {
            this._data = `${this._data['$ge']}`.toLowerCase();
        }
    }
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'greater than' validations.
     *
     * @protected
     * @method cleanDataGreaterThan
     */
    cleanDataGreaterThan() {
        if (Condition.PrimitiveTypes.indexOf(typeof this._data) < 0) {
            this._data = `${this._data['$gt']}`.toLowerCase();
        }
    }
    /**
     * There's no need to prepare a condition's internal value when it always
     * returns TRUE.
     *
     * @protected
     * @method cleanDataIgnored
     */
    cleanDataIgnored() {
        this._data = null;
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * used as pool in later validations.
     *
     * @protected
     * @method cleanDataIn
     */
    cleanDataIn() {
        this._data = Array.isArray(this._data['$in']) ? this._data['$in'] : [];
        this._data = this._data.map((v) => `${v}`.toLowerCase());
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * partially matched in later validations.
     *
     * @protected
     * @method cleanDataLike
     */
    cleanDataLike() {
        if (typeof this._data === 'object') {
            this._data = `${this._data['$like']}`.toLowerCase();
        }
        else {
            this._data = `${this._data}`.toLowerCase();
        }
    }
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'lower than or equal' validations.
     *
     * @protected
     * @method cleanDataLowerOrEqual
     */
    cleanDataLowerOrEqual() {
        if (Condition.PrimitiveTypes.indexOf(typeof this._data) < 0) {
            this._data = `${this._data['$le']}`.toLowerCase();
        }
    }
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'lower than' validations.
     *
     * @protected
     * @method cleanDataLowerThan
     */
    cleanDataLowerThan() {
        if (Condition.PrimitiveTypes.indexOf(typeof this._data) < 0) {
            this._data = `${this._data['$lt']}`.toLowerCase();
        }
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * used as pool in later validations.
     *
     * @protected
     * @method cleanDataNotIn
     */
    cleanDataNotIn() {
        this._data = Array.isArray(this._data['$notIn']) ? this._data['$notIn'] : [];
        this._data = this._data.map((v) => `${v}`.toLowerCase());
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * matched as regular expression in later validations.
     *
     * @protected
     * @method cleanDataRegEx
     */
    cleanDataRegEx() {
        if (typeof this._data['$regex'] !== 'undefined' && this._data['$regex'] instanceof RegExp) {
            this._data = new RegExp(this._data['$regex'], 'i');
        }
        else {
            this.cleanDataWrong();
        }
    }
    /**
     * There's no need to prepare a condition's internal value when it always
     * returns FALSE.
     *
     * @protected
     * @method cleanDataWrong
     */
    cleanDataWrong() {
        this._data = null;
    }
    /**
     * This method holds the logic to validate if a value is another (both values
     * are interpreted as strings).
     *
     * @protected
     * @method validateExact
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateExact(value) {
        return this._data == `${value}`.toLowerCase();
    }
    /**
     * This method holds the logic to validate if a value greater than or equal to
     * the one configure (both values are interpreted as strings unless they are
     * primitive types).
     *
     * @protected
     * @method validateGreaterOrEqual
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateGreaterOrEqual(value) {
        return Condition.PrimitiveTypes.indexOf(typeof value) < 0 ? `${value}`.toLowerCase() >= this._data : value >= this._data;
    }
    /**
     * This method holds the logic to validate if a value greater than the one
     * configure (both values are interpreted as strings unless they are primitive
     * types).
     *
     * @protected
     * @method validateGreaterThan
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateGreaterThan(value) {
        return Condition.PrimitiveTypes.indexOf(typeof value) < 0 ? `${value}`.toLowerCase() > this._data : value > this._data;
    }
    /**
     * This method is used to always accept values.
     *
     * @protected
     * @method validateIgnored
     * @param {any} value Provided for compatibility.
     * @returns {boolean} Always returns TRUE.
     */
    validateIgnored(value) {
        return true;
    }
    /**
     * This method holds the logic to validate if a value is among others in a
     * list (both values are interpreted as strings).
     *
     * @protected
     * @method validateIn
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateIn(value) {
        return this._data.indexOf(`${value}`.toLowerCase()) > -1;
    }
    /**
     * This method holds the logic to validate if a value is on is inside another
     * (both values are interpreted as strings).
     *
     * @protected
     * @method validateLike
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateLike(value) {
        return `${value}`.toLowerCase().indexOf(this._data) > -1;
    }
    /**
     * This method holds the logic to validate if a value lower than or equal to
     * the one configure (both values are interpreted as strings unless they are
     * primitive types).
     *
     * @protected
     * @method validateLowerOrEqual
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateLowerOrEqual(value) {
        return Condition.PrimitiveTypes.indexOf(typeof value) < 0 ? `${value}`.toLowerCase() <= this._data : value <= this._data;
    }
    /**
     * This method holds the logic to validate if a value lower than the one
     * configure (both values are interpreted as strings unless they are primitive
     * types).
     *
     * @protected
     * @method validateLowerThan
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateLowerThan(value) {
        return Condition.PrimitiveTypes.indexOf(typeof value) < 0 ? `${value}`.toLowerCase() < this._data : value < this._data;
    }
    /**
     * This method holds the logic to validate if a value is among others in a
     * list (both values are interpreted as strings).
     *
     * @protected
     * @method validateNotIn
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateNotIn(value) {
        return this._data.indexOf(`${value}`.toLowerCase()) < 0;
    }
    /**
     * This method holds the logic to validate if a value matches a regular
     * expression.
     *
     * @protected
     * @method validateRegEx
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validateRegEx(value) {
        return `${value}`.toLowerCase().match(this._data) !== null;
    }
    /**
     * This method is used to always reject values.
     *
     * @protected
     * @method validateWrong
     * @param {any} value Provided for compatibility.
     * @returns {boolean} Always returns FALSE.
     */
    validateWrong(value) {
        return false;
    }
    //
    // Public class methods.
    /**
     * This method takes a condition data/configuration and returns the proper
     * object to validate it.
     *
     * @static
     * @method BuildCondition
     * @param {string} field Field to which the condition will be associated to.
     * @param {any} conf Configuration to analyse while building a condition.
     * @returns {Condition} Return a condition object.
     */
    static BuildCondition(field, conf) {
        //
        // Default values.
        let type = ConditionTypes.Like;
        //
        // Is it a complex specification?
        if (typeof conf === 'object' && !Array.isArray(conf)) {
            //
            // Cleaning aliases.
            Object.keys(conf).forEach((key) => {
                const newKey = typeof Condition.KeywordsAliases[key] !== 'undefined' ? Condition.KeywordsAliases[key] : null;
                if (newKey) {
                    conf[newKey] = conf[key];
                    delete conf[key];
                }
            });
            //
            // Is there someting to use? Otherwise it's ignored and always
            // validates as valid.
            const keys = Object.keys(conf);
            if (keys.length > 0) {
                //
                // First should say how to preceed. Does it? Otherwise it always
                // validates as insvalid.
                if (typeof Condition.Keywords[keys[0]] !== 'undefined') {
                    type = Condition.Keywords[keys[0]];
                }
                else {
                    type = ConditionTypes.Wrong;
                }
            }
            else {
                type = ConditionTypes.Ignored;
            }
        }
        //
        // Building the right condition.
        return new Condition(type, field, conf);
    }
    /**
     * This method takes a simple list of conditions and builds a list of search
     * condition objects.
     *
     * @static
     * @method BuildConditionsSet
     * @param {SimpleConditionsList} conditions Simple list of conditions.
     * @returns {ConditionsList} Returns a list of search conditions.
     */
    static BuildConditionsSet(conditions) {
        //
        // Default values.
        let out = [];
        //
        // Can it be used to build a list of conditions?
        if (typeof conditions === 'object' && !Array.isArray(conditions)) {
            //
            // Building and adding each condition.
            Object.keys(conditions).forEach((key) => {
                //
                // Is it a list of multiple conditions for the same field?
                if (typeof conditions[key] === 'object' && !Array.isArray(conditions[key]) && Object.keys(conditions[key]).length > 0) {
                    //
                    // Separating each key as a different condition.
                    Object.keys(conditions[key]).forEach((subKey) => {
                        const subConf = {};
                        subConf[subKey] = conditions[key][subKey];
                        out.push(Condition.BuildCondition(key, subConf));
                    });
                }
                else {
                    //
                    // At this point it should be added as a single condition.
                    out.push(Condition.BuildCondition(key, conditions[key]));
                }
            });
        }
        return out;
    }
}
//
// Protected class constants.
Condition.Keywords = {
    '$exact': ConditionTypes.Exact,
    '$ge': ConditionTypes.GreaterOrEqual,
    '$gt': ConditionTypes.GreaterThan,
    '$in': ConditionTypes.In,
    '$le': ConditionTypes.LowerOrEqual,
    '$like': ConditionTypes.Like,
    '$lt': ConditionTypes.LowerThan,
    '$notIn': ConditionTypes.NotIn,
    '$regex': ConditionTypes.RegEx
};
Condition.KeywordsAliases = {
    '=': '$exact',
    '>=': '$ge',
    '>': '$gt',
    '<=': '$le',
    '<': '$lt',
    '*': '$like',
    '$partial': '$like',
    '$regexp': '$regex'
};
Condition.PrimitiveTypes = ['boolean', 'number'];
exports.Condition = Condition;
