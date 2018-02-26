/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */
/**
 * List of known types of conditions.
 * @enum ConditionTypes
 */
export declare enum ConditionTypes {
    Exact = 0,
    GreaterOrEqual = 1,
    GreaterThan = 2,
    Ignored = 3,
    In = 4,
    Like = 5,
    LowerOrEqual = 6,
    LowerThan = 7,
    NotIn = 8,
    Wrong = 9,
}
/**
 * This simple class checks how a list of contitions should be specified.
 * @type ConditionsList
 */
export declare type ConditionsList = Array<Condition>;
/**
 * Standard way to specify simple conditions.
 * @type SimpleConditionsList
 */
export declare type SimpleConditionsList = {
    [name: string]: any;
};
/**
 * This class represents all types of search conditions and how they evaluate
 * values.
 *
 * @class Condition
 */
export declare class Condition {
    [key: string]: any;
    protected static readonly Keywords: {
        [name: string]: ConditionTypes;
    };
    protected static readonly KeywordsAliases: {
        [name: string]: string;
    };
    protected _data: any;
    protected _field: string;
    protected _type: ConditionTypes;
    protected _typeName: string;
    /**
     * @protected
     * @constructor
     */
    protected constructor(conditionType: ConditionTypes, field: string, data: any);
    /**
     * This point will hold the logic to validate a value when this object
     * completes its contruction.
     *
     * @method validate
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    validate: (value: any) => boolean;
    /**
     * This point will hold the logic to check condition data when this object
     * completes its contruction.
     *
     * @method cleanData
     */
    protected cleanData: () => void;
    /**
     * Field name to which this condition is associated.
     *
     * @method field
     * @returns {string} Returns a field name.
     */
    field(): string;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this condition.
     */
    toString: () => string;
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * matched exactly in later validations.
     *
     * @protected
     * @method cleanDataExact
     */
    protected cleanDataExact(): void;
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'greater than or equal' validations.
     *
     * @protected
     * @method cleanDataGreaterOrEqual
     */
    protected cleanDataGreaterOrEqual(): void;
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'greater than' validations.
     *
     * @protected
     * @method cleanDataGreaterThan
     */
    protected cleanDataGreaterThan(): void;
    /**
     * There's no need to prepare a condition's internal value when it always
     * returns TRUE.
     *
     * @protected
     * @method cleanDataIgnored
     */
    protected cleanDataIgnored(): void;
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * used as pool in later validations.
     *
     * @protected
     * @method cleanDataIn
     */
    protected cleanDataIn(): void;
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * partially matched in later validations.
     *
     * @protected
     * @method cleanDataLike
     */
    protected cleanDataLike(): void;
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'lower than or equal' validations.
     *
     * @protected
     * @method cleanDataLowerOrEqual
     */
    protected cleanDataLowerOrEqual(): void;
    /**
     * This method holds the logic to prepare a condition's internal value for
     * later 'lower than' validations.
     *
     * @protected
     * @method cleanDataLowerThan
     */
    protected cleanDataLowerThan(): void;
    /**
     * This method holds the logic to prepare a condition's internal value to be
     * used as pool in later validations.
     *
     * @protected
     * @method cleanDataNotIn
     */
    protected cleanDataNotIn(): void;
    /**
     * There's no need to prepare a condition's internal value when it always
     * returns FALSE.
     *
     * @protected
     * @method cleanDataWrong
     */
    protected cleanDataWrong(): void;
    /**
     * This method holds the logic to validate if a value is another (both values
     * are interpreted as strings).
     *
     * @protected
     * @method validateExact
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateExact(value: any): boolean;
    /**
     * This method holds the logic to validate if a value greater than or equal to
     * the one configure (both values are interpreted as strings).
     *
     * @protected
     * @method validateGreaterOrEqual
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateGreaterOrEqual(value: any): boolean;
    /**
     * This method holds the logic to validate if a value greater than the one
     * configure (both values are interpreted as strings).
     *
     * @protected
     * @method validateGreaterThan
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateGreaterThan(value: any): boolean;
    /**
     * This method is used to always accept values.
     *
     * @protected
     * @method validateIgnored
     * @param {any} value Provided for compatibility.
     * @returns {boolean} Always returns TRUE.
     */
    protected validateIgnored(value: any): boolean;
    /**
     * This method holds the logic to validate if a value is among others in a
     * list (both values are interpreted as strings).
     *
     * @protected
     * @method validateIn
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateIn(value: any): boolean;
    /**
     * This method holds the logic to validate if a value is on is inside another
     * (both values are interpreted as strings).
     *
     * @protected
     * @method validateLike
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateLike(value: any): boolean;
    /**
     * This method holds the logic to validate if a value lower than or equal to
     * the one configure (both values are interpreted as strings).
     *
     * @protected
     * @method validateLowerOrEqual
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateLowerOrEqual(value: any): boolean;
    /**
     * This method holds the logic to validate if a value lower than the one
     * configure (both values are interpreted as strings).
     *
     * @protected
     * @method validateLowerThan
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateLowerThan(value: any): boolean;
    /**
     * This method holds the logic to validate if a value is among others in a
     * list (both values are interpreted as strings).
     *
     * @protected
     * @method validateNotIn
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validateNotIn(value: any): boolean;
    /**
     * This method is used to always reject values.
     *
     * @protected
     * @method validateWrong
     * @param {any} value Provided for compatibility.
     * @returns {boolean} Always returns FALSE.
     */
    protected validateWrong(value: any): boolean;
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
    static BuildCondition(field: string, conf: any): Condition;
    /**
     * This method takes a simple list of conditions and builds a list of search
     * condition objects.
     *
     * @static
     * @method BuildConditionsSet
     * @param {SimpleConditionsList} conditions Simple list of conditions.
     * @returns {ConditionsList} Returns a list of search conditions.
     */
    static BuildConditionsSet(conditions: SimpleConditionsList): ConditionsList;
}
