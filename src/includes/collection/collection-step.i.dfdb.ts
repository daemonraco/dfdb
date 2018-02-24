/**
 * @file collection-step.i.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

/**
 * Internal interfase that standardize recursive asynchronous calls to multiple
 * tasks.
 *
 * @interface ICollectionStep
 */
export interface ICollectionStep {
    /**
     * @property {any} params Data to use when a step is executed.
     */
    params: any;
    /**
     * @property {any} function Function to call on execution of this step. It
     * should returns a promise so it can be chained with other steps.
     */
    stepFunction: (params: any) => Promise<any>;
}
