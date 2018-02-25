"use strict";
/**
 * @file condition.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ConditionTypes;
(function (ConditionTypes) {
    ConditionTypes[ConditionTypes["Exact"] = 0] = "Exact";
    ConditionTypes[ConditionTypes["In"] = 1] = "In";
    ConditionTypes[ConditionTypes["NotIn"] = 2] = "NotIn";
    ConditionTypes[ConditionTypes["Position"] = 3] = "Position";
    ConditionTypes[ConditionTypes["Range"] = 4] = "Range";
})(ConditionTypes = exports.ConditionTypes || (exports.ConditionTypes = {}));
;
class ConditionsList {
}
exports.ConditionsList = ConditionsList;
class Condition {
    //
    // Constructors
    /**
     * @protected
     * @constructor
     */
    constructor(type, data) {
        //
        // Protected properties.
        this._data = null;
        this._rawData = null;
        this._type = null;
        //
        // Public pointer methods.
        this.validate = null;
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
    // Protected methods.
    cleanDataExact() {
        this._data = `${this._rawData['$exact']}`.toLowerCase();
    }
    ;
    cleanDataPosition() {
        this._data = `${this._rawData}`.toLowerCase();
    }
    ;
    validateExact(value) {
        return this._data == value;
    }
    ;
    validatePosition(value) {
        return `${value}`.toLowerCase().indexOf(this._data) > -1;
    }
    ;
    //
    // Public class methods.
    static BuildCondition(conf) {
        let type = ConditionTypes.Position;
        if (typeof conf === 'object' && !Array.isArray(conf)) {
            const keys = Object.keys(conf);
            if (keys.length > 0 && typeof Condition.Keywords[keys[0]] !== 'undefined') {
                type = Condition.Keywords[keys[0]];
            }
        }
        return new Condition(type, conf);
    }
    static BuildConditionsSet(conds) {
        let out = new ConditionsList();
        if (typeof conds === 'object' && !Array.isArray(conds)) {
            Object.keys(conds).forEach((key) => {
                out[key] = Condition.BuildCondition(conds[key]);
            });
        }
        return out;
    }
}
//
// Protected class constants.
Condition.Keywords = {
    '$exact': ConditionTypes.Exact
};
exports.Condition = Condition;
