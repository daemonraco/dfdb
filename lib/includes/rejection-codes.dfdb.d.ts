/**
 * @file rejection-codes.dfdb.ts
 * @author Alejandro D. Simi
 */
/**
 * This class collects the list of known errors thrown in DocsOnFileDB assets.
 *
 * @class RejectionCodes
 */
export declare class RejectionCodes {
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
    static readonly SchemaDoesntApply: string;
    static readonly InvalidSchema: string;
    static readonly UnknownError: string;
    private static readonly _messages;
    /**
     * @constructor
     */
    private constructor();
    static Message(code: string, full?: boolean): string;
}