"use strict";
/**
 * @file rejection.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
const rejection_codes_dfdb_1 = require("./rejection-codes.dfdb");
/**
 * This class represents a generic rejection that can be thrown when a promise
 * fails.
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
        /**
         * This methods provides a proper value for string auto-castings.
         *
         * @method toString
         * @returns {string} Returns a simple string identifying this rejection.
         */
        this.toString = () => {
            return this._fullMessage;
        };
        //
        // Shortcuts.
        this._code = code;
        this._data = data;
        //
        // Basic message values.
        this._message = rejection_codes_dfdb_1.RejectionCodes.Message(this.code());
        this._fullMessage = rejection_codes_dfdb_1.RejectionCodes.Message(this.code(), true);
        //
        // Is there data to append tu current messages.
        if (data) {
            //
            // How should it be interpreted and appended.
            const typeofData = typeof data;
            if (typeofData === 'object' && !Array.isArray(data)) {
                //
                // Taking each field and its value and using it as a simple
                // sentence.
                let extraData = [];
                Object.keys(this._data).forEach(key => {
                    let keyClean = `${key}`.split('');
                    keyClean = keyClean.shift().toUpperCase() + keyClean.join('');
                    extraData.push(`${keyClean}: '${this._data[key]}'`);
                });
                //
                // Updating messages.
                this._message += `. ${extraData.join('. ')}.`;
                this._fullMessage += `. ${extraData.join('. ')}.`;
            }
            else if (typeofData === 'string') {
                //
                // Simple appending given string as a sentence.
                this._message += `. ${data}.`;
                this._fullMessage += `. ${data}.`;
            }
        }
    }
    //
    // Public methods.
    /**
     * This methods provides access to this rejection's code.
     *
     * @method code
     * @returns {string} Returns a rejection code.
     */
    code() {
        return this._code;
    }
    /**
     * This methods provides access to this rejection's attacehed extra
     * information.
     *
     * @method data
     * @returns {any} Returns the attached extra data.
     */
    data() {
        return this._data;
    }
    /**
     * This methods provides access to this rejection's message.
     *
     * @method message
     * @returns {string} Returns a message string.
     */
    message() {
        return this._message;
    }
}
exports.Rejection = Rejection;
