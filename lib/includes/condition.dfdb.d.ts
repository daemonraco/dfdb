/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */
export declare enum ConditionTypes {
    Exact = 0,
    In = 1,
    NotIn = 2,
    Position = 3,
    Range = 4,
}
export declare class ConditionsList {
    [name: string]: Condition;
}
export declare class Condition {
    [key: string]: any;
    protected static readonly Keywords: {
        [name: string]: ConditionTypes;
    };
    protected _data: string;
    protected _rawData: any;
    protected _type: ConditionTypes;
    /**
     * @protected
     * @constructor
     */
    protected constructor(type: ConditionTypes, data: any);
    validate: (value: any) => boolean;
    protected cleanData: () => void;
    protected cleanDataExact(): void;
    protected cleanDataPosition(): void;
    protected validateExact(value: any): boolean;
    protected validatePosition(value: any): boolean;
    static BuildCondition(conf: any): Condition;
    static BuildConditionsSet(conds: {
        [name: string]: any;
    }): ConditionsList;
}
