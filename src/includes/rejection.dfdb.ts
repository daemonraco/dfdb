/**
 * @file rejection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { RejectionCodes } from './rejection-codes.dfdb';

/**
 * This class represents a generic rejection that can be thrown when a promise
 * fails.
 *
 * @class Rejection
 */
export class Rejection {
    //
    // Protected properties.
    protected _code: string = null;
    protected _data: any = null;
    protected _fullMessage: string = null;
    protected _message: string = null;
    //
    // Constructor.
    /**
     * @constructor
     */
    public constructor(code: string, data: any = null) {
        //
        // Shortcuts.
        this._code = code;
        this._data = data;
        //
        // Basic message values.
        this._message = RejectionCodes.Message(this.code());
        this._fullMessage = RejectionCodes.Message(this.code(), true);
        //
        // Is there data to append tu current messages.
        if (data) {
            //
            // How should it be interpreted and appended.
            const typeofData: string = typeof data;
            if (typeofData === 'object' && !Array.isArray(data)) {
                //
                // Taking each field and its value and using it as a simple
                // sentence.
                let extraData: string[] = [];
                Object.keys(this._data).forEach(key => {
                    let keyClean: string[] | string = `${key}`.split('');
                    keyClean = keyClean.shift().toUpperCase() + keyClean.join('');
                    extraData.push(`${keyClean}: '${this._data[key]}'`);
                });
                //
                // Updating messages.
                this._message += `. ${extraData.join('. ')}.`;
                this._fullMessage += `. ${extraData.join('. ')}.`;
            } else if (typeofData === 'string') {
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
    public code(): string {
        return this._code;
    }
    /**
     * This methods provides access to this rejection's attacehed extra
     * information.
     *
     * @method data
     * @returns {any} Returns the attached extra data.
     */
    public data(): any {
        return this._data;
    }
    /**
     * This methods provides access to this rejection's message.
     *
     * @method message
     * @returns {string} Returns a message string.
     */
    public message(): any {
        return this._message;
    }
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this rejection.
     */
    public toString = (): string => {
        return this._fullMessage;
    }
}
