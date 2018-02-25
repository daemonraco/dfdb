/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */
/**
 * List of known types of conditions.
 *
 * @enum ConditionTypes
 */
export declare enum ConditionTypes {
    Exact = 0,
    Ignored = 1,
    In = 2,
    NotIn = 3,
    Position = 4,
    Range = 5,
    Wrong = 6,
}
/**
 * This simple class checks how a list of contitions should be specified.
 *
 * @class ConditionsList
 */
export declare class ConditionsList {
    [name: string]: Condition;
}
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
    protected _data: any;
    protected _type: ConditionTypes;
    /**
     * @protected
     * @constructor
     */
    protected constructor(type: ConditionTypes, data: any);
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
     * This method holds the logic to prepare a condition's internal value to be
     * matched exactly in later validations.
     *
     * @protected
     * @method cleanDataExact
     */
    protected cleanDataExact(): void;
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
     * partially matched in later validations.
     *
     * @protected
     * @method cleanDataPosition
     */
    protected cleanDataPosition(): void;
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
     * This method is used to always accept values.
     *
     * @protected
     * @method validateIgnored
     * @param {any} value Provided for compatibility.
     * @returns {boolean} Always returns TRUE.
     */
    protected validateIgnored(value: any): boolean;
    /**
     * This method holds the logic to validate if a value is on is inside another
     * (both values are interpreted as strings).
     *
     * @protected
     * @method validatePosition
     * @param {any} value Value to check.
     * @returns {boolean} Returns TRUE when it checks out.
     */
    protected validatePosition(value: any): boolean;
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
     * @param {any} conf Configuration to analyse while building a condition.
     * @returns {Condition} Return a condition object.
     */
    static BuildCondition(conf: any): Condition;
    /**
     * This method takes a simple list of conditions and builds a list of search
     * condition objects.
     *
     * @static
     * @method BuildConditionsSet
     * @param {{ [name: string]: any }} conds Simple list of conditions.
     * @returns {ConditionsList} Returns a list of search conditions.
     */
    static BuildConditionsSet(conds: {
        [name: string]: any;
    }): ConditionsList;
}
