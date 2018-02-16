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
    public static readonly Simple: string = 'simple';
    /** @todo 'CollectionTypes.Heavy' will be implemented on v0.2.0 */
    public static readonly Heavy: string = 'heavy';

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

/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class Errors
 */
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
    public static readonly UnknownIndex: string = `[E-0011] Requested index is not present on current collection`;
    public static readonly DatabaseNotConnected: string = '[E-0012] Database not connected';

    private constructor() { }
}
