/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */

export class BasicConstants {
    public static readonly DBExtension: string = '.dfdb';
    public static readonly DefaultSequence: string = '_id';

    private constructor() { }
}

export class ConnectionSaveConstants {
    public static readonly LoadFile: string = 'load-file';
    public static readonly RemoveFile: string = 'remove-file';
    public static readonly UpdateFile: string = 'update-file';

    private constructor() { }
}

export class Errors {
    public static readonly DocIsNotObject: string = '[E-0001] Given document is not an object';
    public static readonly DocNotFound: string = '[E-0002] The requested document does not exist';
    public static readonly NotIndexableValue: string = '[E-0003] Given value can not be indexed';
    public static readonly DuplicatedIndex: string = '[E-0004] Index already present';
    public static readonly NotIndexedField: string = '[E-0005] Field of searched value has no associated index';
    public static readonly CollectionNotConnected: string = '[E-0006] Collection not connected';
    public static readonly IndexNotConnected: string = '[E-0007] Index not connected';
    public static readonly SequenceNotConnected: string = '[E-0008] Sequence not connected';
    public static readonly DatabaseDoesntExist: string = `[E-0009] Requested database doesn't exist`;
    public static readonly DatabaseNotValid: string = `[E-0010] Requested database is not valid`;

    private constructor() { }
}
