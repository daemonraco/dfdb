/**
 * @file interface.resource.dfdb.ts
 * @author Alejandro D. Simi
 */
export interface IResource {
    connect(done: any): void;
    error(): boolean;
    lastError(): string;
}
export interface IDelayedResource {
    skipSave(): void;
}
