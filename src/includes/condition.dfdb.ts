/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */

export enum ConditionTypes { Exact, In, NotIn, Position, Range };

export class ConditionsList {
    //
    // Simple signature.
    [name: string]: Condition;
}

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
    protected _data: string = null;
    protected _rawData: any = null;
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
        this._rawData = data;
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
    public validate: (value: any) => boolean = null;
    //
    // Protected pointer methods.
    protected cleanData: () => void;
    //
    // Protected methods.
    protected cleanDataExact(): void {
        this._data = `${this._rawData['$exact']}`.toLowerCase();
    };
    protected cleanDataPosition(): void {
        this._data = `${this._rawData}`.toLowerCase();
    };
    protected validateExact(value: any): boolean {
        return this._data == value;
    };
    protected validatePosition(value: any): boolean {
        return `${value}`.toLowerCase().indexOf(this._data) > -1;
    };
    //
    // Public class methods.
    public static BuildCondition(conf: any): Condition {
        let type: ConditionTypes = ConditionTypes.Position;

        if (typeof conf === 'object' && !Array.isArray(conf)) {
            const keys = Object.keys(conf);
            if (keys.length > 0 && typeof Condition.Keywords[keys[0]] !== 'undefined') {
                type = Condition.Keywords[keys[0]];
            }
        }

        return new Condition(type, conf);
    }
    public static BuildConditionsSet(conds: { [name: string]: any }): ConditionsList {
        let out: ConditionsList = new ConditionsList();

        if (typeof conds === 'object' && !Array.isArray(conds)) {
            Object.keys(conds).forEach((key: string) => {
                out[key] = Condition.BuildCondition(conds[key]);
            });
        }

        return out;
    }
}