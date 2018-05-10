/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */

/**
 * List of known types of conditions.
 * @enum ConditionTypes
 */
export enum ConditionTypes {
    Exact,
    GreaterOrEqual,
    GreaterThan,
    Ignored,
    In,
    Like,
    LowerOrEqual,
    LowerThan,
    NotIn,
    RegEx,
    Wrong
};

/**
 * This simple class checks how a list of contitions should be specified.
 * @type ConditionsList
 */
export type ConditionsList = Array<Condition>;

/**
 * Standard way to specify simple conditions.
 * @type SimpleConditionsList
 */
export type SimpleConditionsList = { [name: string]: any };

/**
 * This class represents all types of search conditions and how they evaluate
 * values.
 *
 * @class Condition
 */
export class Condition {
    //
    // Signature for dynamic method association.
    [key: string]: any;
    //
    // Protected class constants.
    protected static readonly Keywords: { [name: string]: ConditionTypes } = {
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
    protected static readonly KeywordsAliases: { [name: string]: string } = {
        '=': '$exact',
        '>=': '$ge',
        '>': '$gt',
        '<=': '$le',
        '<': '$lt',
        '*': '$like',
        '$partial': '$like',
        '$regexp': '$regex'
    };
    protected static readonly PrimitiveTypes: string[] = ['boolean', 'number'];
    //
    // Protected properties.
    protected _data: any = null;
    protected _field: string = null;
    protected _type: ConditionTypes = null;
    protected _typeName: string = null;
    //
    // Constructors
    /**
     * @protected
     * @constructor
     */
    protected constructor(conditionType: ConditionTypes, field: string, data: any) {
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
    // Public pointer methods.
    /**
     * This point will hold the logic to validate a value when this object
     * completes its contruction.
     *
     * @method validate
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    public validate: (value: any) => boolean = null;
    //
    // Protected pointer methods.
    /**
     * This point will hold the logic to check condition data when this object
     * completes its contruction.
     *
     * @method cleanData
     */
    protected cleanData: () => void;
    //
    // Public methods.
    /**
     * Field name to which this condition is associated.
     *
     * @method field
     * @returns {string} Returns a field name.
     */
    public field(): string {
        return this._field;
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this condition.
     */
    public toString = (): string => {
        return `condition:${this._field}[${this._typeName}]`;
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
    protected cleanDataExact(): void {
        this._data = `${this._data['$exact']}`.toLowerCase();
    }
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'greater than or equal' validations.
     *
     * @protected
     * @method cleanDataGreaterOrEqual
     */
    protected cleanDataGreaterOrEqual(): void {
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
    protected cleanDataGreaterThan(): void {
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
    protected cleanDataIgnored(): void {
        this._data = null;
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * used as pool in later validations.
     *
     * @protected
     * @method cleanDataIn
     */
    protected cleanDataIn(): void {
        this._data = Array.isArray(this._data['$in']) ? this._data['$in'] : [];
        this._data = this._data.map((v: any) => `${v}`.toLowerCase());
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * partially matched in later validations.
     *
     * @protected
     * @method cleanDataLike
     */
    protected cleanDataLike(): void {
        if (typeof this._data === 'object') {
            this._data = `${this._data['$like']}`.toLowerCase();
        } else {
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
    protected cleanDataLowerOrEqual(): void {
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
    protected cleanDataLowerThan(): void {
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
    protected cleanDataNotIn(): void {
        this._data = Array.isArray(this._data['$notIn']) ? this._data['$notIn'] : [];
        this._data = this._data.map((v: any) => `${v}`.toLowerCase());
    }
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * matched as regular expression in later validations.
     *
     * @protected
     * @method cleanDataRegEx
     */
    protected cleanDataRegEx(): void {
        if (typeof this._data['$regex'] !== 'undefined' && this._data['$regex'] instanceof RegExp) {
            this._data = new RegExp(this._data['$regex'], 'i');
        } else {
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
    protected cleanDataWrong(): void {
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
    protected validateExact(value: any): boolean {
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
    protected validateGreaterOrEqual(value: any): boolean {
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
    protected validateGreaterThan(value: any): boolean {
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
    protected validateIgnored(value: any): boolean {
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
    protected validateIn(value: any): boolean {
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
    protected validateLike(value: any): boolean {
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
    protected validateLowerOrEqual(value: any): boolean {
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
    protected validateLowerThan(value: any): boolean {
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
    protected validateNotIn(value: any): boolean {
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
    protected validateRegEx(value: any): boolean {
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
    protected validateWrong(value: any): boolean {
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
    public static BuildCondition(field: string, conf: any): Condition {
        //
        // Default values.
        let type: ConditionTypes = ConditionTypes.Like;
        //
        // Is it a complex specification?
        if (typeof conf === 'object' && !Array.isArray(conf)) {
            //
            // Cleaning aliases.
            Object.keys(conf).forEach((key: string) => {
                const newKey: string = typeof Condition.KeywordsAliases[key] !== 'undefined' ? Condition.KeywordsAliases[key] : null;
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
                } else {
                    type = ConditionTypes.Wrong;
                }
            } else {
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
    public static BuildConditionsSet(conditions: SimpleConditionsList): ConditionsList {
        //
        // Default values.
        let out: ConditionsList = [];
        //
        // Can it be used to build a list of conditions?
        if (typeof conditions === 'object' && !Array.isArray(conditions)) {
            //
            // Building and adding each condition.
            Object.keys(conditions).forEach((key: string) => {
                //
                // Is it a list of multiple conditions for the same field?
                if (typeof conditions[key] === 'object' && !Array.isArray(conditions[key]) && Object.keys(conditions[key]).length > 0) {
                    //
                    // Separating each key as a different condition.
                    Object.keys(conditions[key]).forEach((subKey: string) => {
                        const subConf: any = {};
                        subConf[subKey] = conditions[key][subKey];
                        out.push(Condition.BuildCondition(key, subConf));
                    });
                } else {
                    //
                    // At this point it should be added as a single condition.
                    out.push(Condition.BuildCondition(key, conditions[key]));
                }
            });
        }

        return out;
    }
}