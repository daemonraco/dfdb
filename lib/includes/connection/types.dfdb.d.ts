/**
 * @file types.dfdb.ts
 * @author Alejandro D. Simi
 */
/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
export declare class ConnectionDBValidationResult {
    exists: boolean;
    valid: boolean;
    error: string;
    errorCode: string;
}
/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
export declare class ConnectionSavingQueueResult {
    error: string;
    data: string;
}
