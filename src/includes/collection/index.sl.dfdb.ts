/**
 * @file index.sl.dfdb.ts
 * @author Alejandro D. Simi
 */

import { Promise } from 'es6-promise';

import { Collection } from './collection.dfdb';
import { ICollectionStep } from './collection-step.i.dfdb';
import { Index } from '../index.dfdb';
import { IOpenCollectionIndex } from './open-collection.i.dfdb';
import { Rejection } from '../rejection.dfdb';
import { RejectionCodes } from '../rejection-codes.dfdb';
import { SubLogic } from '../sub-logic.dfdb';
import { Tools } from '../tools.dfdb';

export class SubLogicIndex extends SubLogic<IOpenCollectionIndex> {
    //
    // Public methods.
    /**
     * This method adds certain document to all field indexes.
     *
     * @method addDocToIndexes
     * @param {{ [name: string]: any }} doc Document to be added.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public addDocToIndexes(doc: { [name: string]: any }): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: { doc, name },
                    stepFunction: (params: any) => this.addDocToIndex(params)
                });
            });
            //
            // Indexing.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method associates a new index to a root document field and trigger
     * it's first indexation.
     *
     * @method addFieldIndex
     * @param {name} name Field to index. It also acts as index name.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public addFieldIndex(name: string): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected and is it a new index?
            if (this._mainObject._connected && typeof this._mainObject._indexes[name] === 'undefined') {
                //
                // Adding index to the internal manifest.
                this._mainObject._manifest.indexes[name] = { name, field: name };
                //
                // Reloading all indexes into memory to include the new one.
                this.loadIndexes(null)
                    .then(() => {
                        // Adding all documents.
                        //
                        // List of ids to analyse.
                        let ids = Object.keys(this._mainObject._data);
                        //
                        // Recursive add-and-wait of all documents to the new
                        // index.
                        const processIds = () => {
                            const id = ids.shift();
                            if (id) {
                                //
                                // Skiping physical save, that will be done when
                                // all documents are added.
                                this._mainObject._indexes[name].skipSave();
                                this._mainObject._indexes[name].addDocument(this._mainObject._data[id])
                                    .then(processIds)
                                    .catch(reject);
                            } else {
                                //
                                // Saving all changes to this collection and also
                                // saving all changes made on the new index.
                                this._mainObject.save()
                                    .then(resolve)
                                    .catch(reject);
                            }
                        };
                        processIds();
                    })
                    .catch(reject);
            } else if (!this._mainObject._connected) {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._lastRejection);
            } else {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.DuplicatedIndex, { index: name }));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * This method closes all field indexes.
     *
     * @method closeIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public closeIndexes(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params: any) => this.closeIndex(params)
                });
            });
            //
            // Closing.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Removes a field associated index and triggers the removal of its physical
     * data inside the zip file.
     *
     * @method dropFieldIndex
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public dropFieldIndex(name: string): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected and does it have the requested index?
            if (this._mainObject._connected && typeof this._mainObject._indexes[name] !== 'undefined') {
                //
                // Ask index to get dropped.
                this._mainObject._indexes[name].drop()
                    .then(() => {
                        //
                        // Updates the information inside the zip file.
                        this._mainObject.save()
                            .then(() => {
                                //
                                // Forgets everything about this index.
                                delete this._mainObject._manifest.indexes[name];
                                delete this._mainObject._indexes[name];

                                resolve();
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                //
                // If it's not connected or it's not a known index, nothing is
                // done.
                resolve();
            }
        });
    }
    /**
     * This method drops all field indexes.
     *
     * @method dropIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public dropIndexes(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params: any) => this.dropIndex(params)
                });
            });
            //
            // Dropping.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * Checks if this collection has a specific index.
     *
     * @method hasIndex
     * @param {string} name Index name to search.
     * @returns {boolean} Returns TRUE when it's a known index.
     */
    public hasIndex(name: string): boolean {
        return typeof this._mainObject._manifest.indexes[name] !== 'undefined';
    }
    /**
     * List all indexes of this collection
     *
     * @method indexes
     * @returns {{[name:string]:any}} Retruns a simple object listing indexes.
     */
    public indexes(): { [name: string]: any } {
        return Tools.DeepCopy(this._mainObject._manifest.indexes);
    }
    /**
     * This method loads all associated field indexes.
     *
     * @protected
     * @method loadIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public loadIndexes(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._manifest.indexes).forEach(key => {
                steps.push({
                    params: this._mainObject._manifest.indexes[key],
                    stepFunction: (params: any) => this.loadIndex(params)
                });
            })
            //
            // Loading.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method removes a document from a specific index.
     *
     * @method rebuildAllIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public rebuildAllIndexes(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: name,
                    stepFunction: (params: any) => this.rebuildFieldIndex(params)
                });
            });
            //
            // Closing.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method forces a index to reload and reindex all documents.
     *
     * @method rebuildFieldIndex
     * @param {string} name Name of the field index to rebuild.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public rebuildFieldIndex(name: string): Promise<void> {
        //
        // Restarting error messages.
        this._mainObject.resetError();
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Is it connected and is it a known field index.
            if (this._mainObject._connected && typeof this._mainObject._indexes[name] !== 'undefined') {
                //
                // Dropping index as a way to drop any error.
                this.dropFieldIndex(name)
                    .then(() => {
                        //
                        // Readding index so it starts from scratch.
                        this.addFieldIndex(name)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(reject);
            } else if (!this._mainObject._connected) {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.CollectionNotConnected));
                reject(this._mainObject._lastRejection);
            } else {
                this._mainObject.setLastRejection(new Rejection(RejectionCodes.UnknownIndex, { index: name }));
                reject(this._mainObject._lastRejection);
            }
        });
    }
    /**
     * This method a document from all field indexes.
     *
     * @method removeDocFromIndexes
     * @param {string} id ID of the document to be removed.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public removeDocFromIndexes(id: string): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: { id, name },
                    stepFunction: (params: any) => this.removeDocFromIndex(params)
                });
            })
            //
            // Removing document.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method truncates all field indexes.
     *
     * @method truncateIndexes
     * @param {any} params This parameter is provided for compatibility, but it's
     * not used.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    public truncateIndexes(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // List of operations.
            let steps: any[] = [];
            //
            // Generating a step for each field index.
            Object.keys(this._mainObject._indexes).forEach(name => {
                steps.push({
                    params: { name },
                    stepFunction: (params: any) => this.truncateIndex(params)
                });
            })
            //
            // Truncating.
            Collection.ProcessStepsSequence(steps)
                .then(resolve)
                .catch(reject);
        });
    }
    //
    // Protected methods.
    /**
     * This method adds a document to a specific index.
     *
     * @protected
     * @method addDocToIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name', 'doc').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected addDocToIndex(params: { [name: string]: any }): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._mainObject._indexes[params.name].skipSave();
            //
            // Adding document.
            this._mainObject._indexes[params.name].addDocument(params.doc)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This closes a specific index.
     *
     * @protected
     * @method closeIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected closeIndex(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._mainObject._indexes[params.name].skipSave();
            //
            // Closing index.
            this._mainObject._indexes[params.name].close()
                .then(() => {
                    //
                    // Forgetting index object so, in any case, it's reloaded.
                    delete this._mainObject._indexes[params.name];
                    resolve();
                })
                .catch(reject);
        });
    }
    /**
     * This method drops a specific index.
     *
     * @protected
     * @method dropIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected dropIndex(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Forgetting index.
            delete this._mainObject._manifest.indexes[params.name];
            //
            // Asking index to get dropped.
            this._mainObject._indexes[params.name].drop()
                .then(() => {
                    //
                    // Forgetting index object.
                    delete this._mainObject._indexes[params.name];
                    resolve();
                })
                .catch(reject);
        });
    }
    /**
     * This closes a specific index.
     *
     * @protected
     * @method loadIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation.
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected loadIndex(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            if (typeof this._mainObject._indexes[params.name] === 'undefined') {
                this._mainObject._indexes[params.name] = new Index((<any>this._mainObject), params.field, this._mainObject._connection);
                this._mainObject._indexes[params.name].connect()
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
    /**
     * This method removes a document from a specific index.
     *
     * @protected
     * @method removeDocFromIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('id', 'name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected removeDocFromIndex(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._mainObject._indexes[params.name].skipSave();
            //
            // Removing document based on its ID.
            this._mainObject._indexes[params.name].removeDocument(params.id)
                .then(resolve)
                .catch(reject);
        });
    }
    /**
     * This method truncates a specific index.
     *
     * @protected
     * @method truncateIndex
     * @param {{ [name: string]: any }} params List of required parameters to
     * perform this operation ('name').
     * @returns {Promise<void>} Return a promise that gets resolved when the
     * operation finishes.
     */
    protected truncateIndex(params: any): Promise<void> {
        //
        // Building promise to return.
        return new Promise<void>((resolve: () => void, reject: (err: Rejection) => void) => {
            //
            // Skipping physical save, that will be dealt with later.
            this._mainObject._indexes[params.name].skipSave();
            this._mainObject._indexes[params.name].truncate()
                .then(resolve)
                .catch(reject);
        });
    }
}