/**
 * @file types.dfdb.ts
 * @author Alejandro D. Simi
 */

/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
export class ConnectionDBValidationResult {
    public exists: boolean = false;
    public valid: boolean = false;
    public error: string = null;
    public errorCode: string = null;
}

/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
export class ConnectionSavingQueueResult {
    public error: string = null;
    public data: string = null;
}
