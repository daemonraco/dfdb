/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */
/**
 * This basic class provides a set of generic constants used by all DocsOnFileDB
 * assets.
 *
 * @class BasicConstants
 */
export declare class BasicConstants {
    static readonly DBExtension: string;
    static readonly DefaultSequence: string;
    private constructor();
}
/**
 * This class provides a specific set of constants used by the connection class to
 * queue operation on the zip file.
 *
 * @class ConnectionSaveConstants
 */
export declare class ConnectionSaveConstants {
    static readonly LoadFile: string;
    static readonly RemoveFile: string;
    static readonly UpdateFile: string;
    private constructor();
}
/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class Errors
 */
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
    static readonly DatabaseNotConnected: string;
    private constructor();
}
