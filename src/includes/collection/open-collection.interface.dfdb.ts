/**
 * @file open-collection.interface.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { Index } from '../index.dfdb';
import { Rejection } from '../rejection.dfdb';

/**
 * @todo DOC
 *
 * @interface IOpenCollectionSeeker
 */
export interface IOpenCollectionSeeker {
    _data: { [name: string]: any };
    _indexes: { [name: string]: Index };

    error(): boolean;
    resetError(): void;
    setLastRejection(rejection: Rejection): void;
}
