"use strict";
/**
 * @file rejection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const rejection_codes_dfdb_1 = require("./rejection-codes.dfdb");
/**
 * @todo DOC
 *
 * @class Rejection
 */
class Rejection {
    //
    // Constructor.
    /**
     * @constructor
     */
    constructor(code, data = null) {
        //
        // Protected properties.
        this._code = null;
        this._data = null;
        this._fullMessage = null;
        this._message = null;
        this.toString = () => {
            return this._fullMessage;
        };
        this._code = code;
        this._data = data;
        this._message = rejection_codes_dfdb_1.RejectionCodes.Message(this.code());
        this._fullMessage = rejection_codes_dfdb_1.RejectionCodes.Message(this.code(), true);
        if (data) {
            const typeofData = typeof data;
            if (typeofData === 'object' && Array.isArray(data)) {
                let extraData = [];
                Object.keys(this._data).forEach(key => {
                    extraData.push(`${key}: ${this._data[key]}`);
                });
                this._fullMessage += `. ${extraData.join('. ')}.`;
            }
            else if (typeofData === 'string') {
                this._fullMessage += `. ${data}.`;
            }
        }
    }
    //
    // Public methods.
    code() {
        return this._code;
    }
    data() {
        return this._data;
    }
    message() {
        return this._message;
    }
}
exports.Rejection = Rejection;
