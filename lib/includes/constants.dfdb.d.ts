/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */
export declare class BasicConstants {
    static readonly DBExtension: string;
    static readonly DefaultSequence: string;
    private constructor();
}
export declare class ConnectionSaveConstants {
    static readonly LoadFile: string;
    static readonly RemoveFile: string;
    static readonly UpdateFile: string;
    private constructor();
}
export declare class Errors {
    static readonly DocIsNotObject: string;
    static readonly DocNotFound: string;
    static readonly NotIndexableValue: string;
    static readonly DuplicatedIndex: string;
    static readonly NotIndexedField: string;
    static readonly CollectionNotConnected: string;
    static readonly IndexNotConnected: string;
    static readonly SequenceNotConnected: string;
    static readonly DatabaseDoesntExist: string;
    static readonly DatabaseNotValid: string;
    static readonly UnknownIndex: string;
    private constructor();
}
