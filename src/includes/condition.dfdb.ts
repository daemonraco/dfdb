/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */

/**
 * List of known types of conditions.
 *
 * @enum ConditionTypes
 */
export enum ConditionTypes { Exact, Ignored, In, NotIn, Position, Range, Wrong };

/**
 * This simple class checks how a list of contitions should be specified.
 *
 * @class ConditionsList
 */
export class ConditionsList {
    //
    // Simple signature.
    [name: string]: Condition;
}

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
        '$exact': ConditionTypes.Exact
    };
    //
    // Protected properties.
    protected _data: any = null;
    protected _type: ConditionTypes = null;
    //
    // Constructors
    /**
     * @protected
     * @constructor
     */
    protected constructor(type: ConditionTypes, data: any) {
        //
        // Shortcuts.
        this._type = type;
        this._data = data;
        //
        // Setting pointer methods.
        this.cleanData = this[`cleanData${ConditionTypes[this._type]}`];
        this.validate = this[`validate${ConditionTypes[this._type]}`];
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
     * partially matched in later validations.
     *
     * @protected
     * @method cleanDataPosition
     */
    protected cleanDataPosition(): void {
        this._data = `${this._data}`.toLowerCase();
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
     * This method holds the logic to validate if a value is on is inside another
     * (both values are interpreted as strings).
     *
     * @protected
     * @method validatePosition
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validatePosition(value: any): boolean {
        return `${value}`.toLowerCase().indexOf(this._data) > -1;
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
     * @param {any} conf Configuration to analyse while building a condition.
     * @returns {Condition} Return a condition object.
     */
    public static BuildCondition(conf: any): Condition {
        //
        // Default values.
        let type: ConditionTypes = ConditionTypes.Position;
        //
        // Is it a complex specification?
        if (typeof conf === 'object' && !Array.isArray(conf)) {
            const keys = Object.keys(conf);
            //
            // Is there someting to use? Otherwise it's ignored and always
            // validates as valid.
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

        return new Condition(type, conf);
    }
    /**
     * This method takes a simple list of conditions and builds a list of search
     * condition objects.
     *
     * @static
     * @method BuildConditionsSet
     * @param {{ [name: string]: any }} conds Simple list of conditions.
     * @returns {ConditionsList} Returns a list of search conditions.
     */
    public static BuildConditionsSet(conds: { [name: string]: any }): ConditionsList {
        //
        // Default values.
        let out: ConditionsList = new ConditionsList();
        //
        // Can it be used to build a list of conditions?
        if (typeof conds === 'object' && !Array.isArray(conds)) {
            //
            // Building and adding each condition.
            Object.keys(conds).forEach((key: string) => {
                out[key] = Condition.BuildCondition(conds[key]);
            });
        }

        return out;
    }
}