/**
 * @file rejection-codes.dfdb.ts
 * @author Alejandro D. Simi
 */

/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class RejectionCodes
 */
export class RejectionCodes {
    //
    // Public class constants.
    public static readonly DocIsNotObject: string = 'E-0001';
    public static readonly DocNotFound: string = 'E-0002';
    public static readonly NotIndexableValue: string = 'E-0003';
    public static readonly DuplicatedIndex: string = 'E-0004';
    public static readonly NotIndexedField: string = 'E-0005';
    public static readonly CollectionNotConnected: string = 'E-0006';
    public static readonly IndexNotConnected: string = 'E-0007';
    public static readonly SequenceNotConnected: string = 'E-0008';
    public static readonly DatabaseDoesntExist: string = `E-0009`;
    public static readonly DatabaseNotValid: string = `E-0010`;
    public static readonly UnknownIndex: string = `E-0011`;
    public static readonly DatabaseNotConnected: string = 'E-0012';
    public static readonly SchemaDoesntApply: string = `E-0013`;
    public static readonly InvalidSchema: string = `E-0014`;
    public static readonly UnknownError: string = `E-0015`;
    public static readonly InvalidDBPath: string = `E-0016`;
    public static readonly NotImplemented: string = `E-0017`;
    public static readonly InvalidJSON: string = `E-0018`;
    public static readonly InvalidJSONString: string = `E-0019`;
    public static readonly InvalidJSONFile: string = `E-0020`;
    public static readonly DatabaseLocked: string = `E-0021`;
    //
    // Private class constants.
    private static readonly _messages: { [name: string]: string } = {
        'E-0001': 'Given document is not an object',
        'E-0002': 'The requested document does not exist',
        'E-0003': 'Given value can not be indexed',
        'E-0004': 'Index already present',
        'E-0005': 'Field of searched value has no associated index',
        'E-0006': 'Collection not connected',
        'E-0007': 'Index not connected',
        'E-0008': 'Sequence not connected',
        'E-0009': `Requested database doesn't exist`,
        'E-0010': `Requested database is not valid`,
        'E-0011': `Requested index is not present on current collection`,
        'E-0012': 'Database not connected',
        'E-0013': `Document doesn't follow the given schema`,
        'E-0014': `Given schema is not valid`,
        'E-0015': `An unknown error has been triggered`,
        'E-0016': `Invalid database path`,
        'E-0017': `This is not implemented yet`,
        'E-0018': `Given JSON object is not a valid`,
        'E-0019': `Given string is not a valid JSON`,
        'E-0020': `Given file contents is not a valid JSON`,
        'E-0021': `Unable to establish a database connection because it is locked`
    };
    //
    // Constructor.
    /**
     * @constructor
     */
    private constructor() { }
    //
    // Public class methods.
    /**
     * This method generates a simple rejection message based on a error code.
     *
     * @public
     * @static
     * @method Message
     * @param {string} code Error code identifying a rejection case.
     * @param {boolean} full Should the generated message include the rejection
     * code.
     * @returns {string} Retruns a simple error message.
     */
    public static Message(code: string, full: boolean = false): string {
        //
        // Is it a valid code?
        if (typeof RejectionCodes._messages[code] === 'undefined') {
            throw `Unknown rejection code '${code}'`;
        }
        //
        // Building and returning a message.
        return `${full ? `[${code}] ` : ''}${RejectionCodes._messages[code]}`;
    }
}
