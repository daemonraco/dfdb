/**
 * This class represents a generic rejection that can be thrown when a promise
 * fails.
 *
 * @class Rejection
 */
export declare class Rejection {
    protected _code: string;
    protected _data: any;
    protected _fullMessage: string;
    protected _message: string;
    /**
     * @constructor
     */
    constructor(code: string, data?: any);
    /**
     * This methods provides access to this rejection's code.
     *
     * @method code
     * @returns {string} Returns a rejection code.
     */
    code(): string;
    /**
     * This methods provides access to this rejection's attacehed extra
     * information.
     *
     * @method data
     * @returns {any} Returns the attached extra data.
     */
    data(): any;
    /**
     * This methods provides access to this rejection's message.
     *
     * @method message
     * @returns {string} Returns a message string.
     */
    message(): any;
    /**
     * This methods provides a proper value for string auto-castings.
     *
     * @method toString
     * @returns {string} Returns a simple string identifying this rejection.
     */
    toString: () => string;
}
