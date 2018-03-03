"use strict";
/**
 * @file rejection-codes.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class RejectionCodes
 */
class RejectionCodes {
    //
    // Constructor.
    /**
     * @constructor
     */
    constructor() { }
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
    static Message(code, full = false) {
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
//
// Public class constants.
RejectionCodes.DocIsNotObject = 'E-0001';
RejectionCodes.DocNotFound = 'E-0002';
RejectionCodes.NotIndexableValue = 'E-0003';
RejectionCodes.DuplicatedIndex = 'E-0004';
RejectionCodes.NotIndexedField = 'E-0005';
RejectionCodes.CollectionNotConnected = 'E-0006';
RejectionCodes.IndexNotConnected = 'E-0007';
RejectionCodes.SequenceNotConnected = 'E-0008';
RejectionCodes.DatabaseDoesntExist = `E-0009`;
RejectionCodes.DatabaseNotValid = `E-0010`;
RejectionCodes.UnknownIndex = `E-0011`;
RejectionCodes.DatabaseNotConnected = 'E-0012';
RejectionCodes.SchemaDoesntApply = `E-0013`;
RejectionCodes.InvalidSchema = `E-0014`;
RejectionCodes.UnknownError = `E-0015`;
RejectionCodes.InvalidDBPath = `E-0016`;
RejectionCodes.NotImplemented = `E-0017`;
RejectionCodes.InvalidJSON = `E-0018`;
RejectionCodes.InvalidJSONString = `E-0019`;
RejectionCodes.InvalidJSONFile = `E-0020`;
//
// Private class constants.
RejectionCodes._messages = {
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
    'E-0020': `Given file contents is not a valid JSON`
};
exports.RejectionCodes = RejectionCodes;
