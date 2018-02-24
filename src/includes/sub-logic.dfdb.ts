/**
 * @file sub-logic.dfdb.ts
 * @author Alejandro D. Simi
 */

export abstract class SubLogic<T> {
    //
    // Protected properties.
    protected _mainObject: T = null;
    //
    // Constructors.
    /**
     * @constructor
     */
    public constructor(mainObject: any) {
        this._mainObject = <T>mainObject;
    }
}