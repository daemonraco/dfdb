"use strict";
/**
 * @file types.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Internal class to handle database check results.
 *
 * @class ConnectionDBValidationResult
 */
class ConnectionDBValidationResult {
    constructor() {
        this.exists = false;
        this.valid = false;
        this.error = null;
        this.errorCode = null;
    }
}
exports.ConnectionDBValidationResult = ConnectionDBValidationResult;
/**
 * Internal class to handle physical interaction responses with the database.
 *
 * @class ConnectionSavingQueueResult
 */
class ConnectionSavingQueueResult {
    constructor() {
        this.error = null;
        this.data = null;
    }
}
exports.ConnectionSavingQueueResult = ConnectionSavingQueueResult;
