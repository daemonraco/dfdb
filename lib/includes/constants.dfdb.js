"use strict";
/**
 * @file constants.dfdb.ts
 * @author Alejandro D. Simi
 */
Object.defineProperty(exports, "__esModule", { value: true });
class BasicConstants {
    constructor() { }
}
BasicConstants.DBExtension = '.dfdb';
BasicConstants.DefaultSequence = '_id';
exports.BasicConstants = BasicConstants;
class Errors {
    constructor() { }
}
Errors.DocIsNotObject = '[E-0001] Given document is not an object';
Errors.DocNotFound = '[E-0002] The requested document does not exist';
Errors.NotIndexableValue = '[E-0003] Given value can not be indexed';
Errors.DuplicatedIndex = '[E-0004] Index already present';
Errors.NotIndexedField = '[E-0005] Field of searched value has no associated index';
exports.Errors = Errors;
