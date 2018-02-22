/**
 * @file rejection.dfdb.ts
 * @author Alejandro D. Simi
 */

import { RejectionCodes } from './rejection-codes.dfdb';

/**
 * @todo DOC
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
        this._code = code;
        this._data = data;

        this._message = RejectionCodes.Message(this.code());
        this._fullMessage = RejectionCodes.Message(this.code(), true);

        if (data) {
            const typeofData: string = typeof data;

            if (typeofData === 'object' && Array.isArray(data)) {
                let extraData: string[] = [];
                Object.keys(this._data).forEach(key => {
                    extraData.push(`${key}: ${this._data[key]}`);
                });

                this._fullMessage += `. ${extraData.join('. ')}.`;
            } else if (typeofData === 'string') {
                this._fullMessage += `. ${data}.`;
            }
        }
    }
    //
    // Public methods.
    public code(): string {
        return this._code;
    }
    public data(): any {
        return this._data;
    }
    public message(): any {
        return this._message;
    }
    public toString = (): string => {
        return this._fullMessage;
    }
    //
    // Public class methods.

    //
    // Protected class methods.

}
