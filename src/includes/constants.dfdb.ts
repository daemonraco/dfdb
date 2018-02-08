/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */

export class BasicConstants {
    public static readonly DBExtension: string = '.dfdb';
    public static readonly DefaultSequence: string = '_id';

    private constructor() { }
}

export class Errors {
    public static readonly DocIsNotObject: string = '[E-0001] Given document is not an object';
    public static readonly DocNotFound: string = '[E-0002] The requested document does not exist';
    public static readonly NotIndexableValue: string = '[E-0003] Given value can not be indexed';
    public static readonly DuplicatedIndex: string = '[E-0004] Index already present';
    public static readonly NotIndexedField: string = '[E-0005] Field of searched value has no associated index';

    private constructor() { }
}
