/**
 * @todo DOC
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
    code(): string;
    data(): any;
    message(): any;
    toString: () => string;
}
