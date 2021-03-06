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
    static readonly DBLockExtension: string;
    static readonly DefaultSequence: string;
    private constructor();
}
/**
 * This class provides a set of constants used to identify the kind of internal
 * logic a collection uses.
 *
 * @class CollectionTypes
 */
export declare class CollectionTypes {
    /** @todo 'CollectionTypes.Heavy' will be implemented on v0.2.0 */
    static readonly Heavy: string;
    static readonly Simple: string;
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
