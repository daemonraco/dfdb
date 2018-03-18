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
export class BasicConstants {
    public static readonly DBExtension: string = '.dfdb';
    public static readonly DBLockExtension: string = '.lock';
    public static readonly DefaultSequence: string = '_id';

    private constructor() { }
}

/**
 * This class provides a set of constants used to identify the kind of internal
 * logic a collection uses.
 *
 * @class CollectionTypes
 */
export class CollectionTypes {
    /** @todo 'CollectionTypes.Heavy' will be implemented on v0.2.0 */
    public static readonly Heavy: string = 'heavy';
    public static readonly Simple: string = 'simple';

    private constructor() { }
}

/**
 * This class provides a specific set of constants used by the connection class to
 * queue operation on the zip file.
 *
 * @class ConnectionSaveConstants
 */
export class ConnectionSaveConstants {
    public static readonly LoadFile: string = 'load-file';
    public static readonly RemoveFile: string = 'remove-file';
    public static readonly UpdateFile: string = 'update-file';

    private constructor() { }
}
