import Err from './-private/err';
import isObject from './utils/is-object';
import mergeDeep from './utils/merge-deep';
import setDeep from './utils/set-deep';
import getDeep from './utils/get-deep';
import type { Changes, Config, Content, Errors, IErr, INotifier, InternalMap, NewProperty, Snapshot, ValidationErr } from './types';
declare const CONTENT = "_content";
declare const PREVIOUS_CONTENT = "_previousContent";
declare const CHANGES = "_changes";
declare const ERRORS = "_errors";
declare const ERRORS_CACHE = "_errorsCache";
declare const OPTIONS = "_options";
declare function maybeUnwrapProxy(content: Content): any;
export declare function newFormat(obj: Record<string, any>[], original: any, getDeep: (obj: any, key: string) => any): Record<string, any>;
export declare class ValidatedChangeset {
    constructor(obj: object, options?: Config);
    /**
     * Any property that is not one of the getter/setter/methods on the
     * BufferedProxy instance. The value type is `unknown` in order to avoid
     * having to predefine key/value pairs of the correct types in the target
     * object. Setting the index signature to `[key: string]: T[K]` would allow us
     * to typecheck the value that is set on the proxy. However, no
     * getters/setters/methods can be added to the class. This is the tradeoff
     * we make for this particular design pattern (class based BufferedProxy).
     */
    [key: string]: unknown;
    [CONTENT]: object;
    [PREVIOUS_CONTENT]: object | undefined;
    [CHANGES]: Changes;
    [ERRORS]: Errors<any>;
    [ERRORS_CACHE]: Errors<any>;
    [OPTIONS]: Config;
    __changeset__: string;
    _eventedNotifiers: {};
    on(eventName: string, callback: (...args: unknown[]) => unknown): INotifier;
    off(eventName: string, callback: (...args: unknown[]) => unknown): INotifier;
    trigger(eventName: string, ...args: any[]): void;
    /**
     * @property isObject
     * @override
     */
    isObject: typeof isObject;
    /**
     * @property maybeUnwrapProxy
     * @override
     */
    maybeUnwrapProxy: typeof maybeUnwrapProxy;
    /**
     * @property setDeep
     * @override
     */
    setDeep: typeof setDeep;
    /**
     * @property getDeep
     * @override
     */
    getDeep: typeof getDeep;
    /**
     * @property mergeDeep
     * @override
     */
    mergeDeep: typeof mergeDeep;
    /**
     * @property safeGet
     * @override
     */
    safeGet(obj: any, key: string): any;
    /**
     * @property safeSet
     * @override
     */
    safeSet(obj: any, key: string, value: unknown): unknown;
    /**
     * @property changes
     * @type {Array}
     */
    get changes(): Record<string, any>;
    /**
     * @property errors
     * @type {Array}
     */
    get errors(): import("./types").PublicErrors;
    get change(): Changes;
    get error(): Errors<any>;
    get data(): object;
    /**
     * @property isValid
     * @type {Array}
     */
    get isValid(): boolean;
    /**
     * @property isPristine
     * @type {Boolean}
     */
    get isPristine(): boolean;
    /**
     * @property isInvalid
     * @type {Boolean}
     */
    get isInvalid(): boolean;
    /**
     * @property isDirty
     * @type {Boolean}
     */
    get isDirty(): boolean;
    /**
     * Stores change on the changeset.
     * This approximately works just like the Ember API
     *
     * @method setUnknownProperty
     */
    setUnknownProperty<T>(key: string, value: T): void;
    /**
     * String representation for the changeset.
     */
    get [Symbol.toStringTag](): string;
    /**
     * String representation for the changeset.
     */
    toString(): string;
    /**
     * Executes the changeset if in a valid state.
     *
     * @method execute
     */
    execute(): this;
    unexecute(): this;
    /**
     * Returns the changeset to its pristine state, and discards changes and
     * errors.
     *
     * @method rollback
     */
    rollback(): this;
    /**
     * Discards any errors, keeping only valid changes.
     *
     * @public
     * @chainable
     * @method rollbackInvalid
     * @param {String} key optional key to rollback invalid values
     * @return {Changeset}
     */
    rollbackInvalid(key: string | void): this;
    /**
     * @method validate
     */
    validate(cb: (changes: Record<string, any>) => unknown): Promise<any>;
    /**
     * Manually add an error to the changeset. If there is an existing
     * error or change for `key`, it will be overwritten.
     *
     * @method addError
     */
    addError<T>(key: string, error: IErr<T> | ValidationErr): Err;
    /**
     * @method removeError
     */
    removeError(key: string): void;
    /**
     * @method removeError
     */
    removeErrors(): void;
    /**
     * Manually push multiple errors to the changeset as an array.
     * key maybe in form 'name.short' so need to go deep
     *
     * @method pushErrors
     */
    pushErrors(key: string, ...newErrors: string[] | ValidationErr[]): IErr<any>;
    /**
     * Creates a snapshot of the changeset's errors and changes.
     *
     * @method snapshot
     */
    snapshot(): Snapshot;
    private getChangesForSnapshot;
    /**
     * Restores a snapshot of changes and errors. This overrides existing
     * changes and errors.
     *
     * @method restore
     */
    restore({ changes, errors }: Snapshot): this;
    private getChangesFromSnapshot;
    private getChangeForProp;
    /**
     * Sets property on the changeset.
     */
    _setProperty<T>({ key, value, oldValue }: NewProperty<T>): void;
    /**
     * Notifies virtual properties set on the changeset of a change.
     * You can specify which keys are notified by passing in an array.
     *
     * @private
     * @param {Array} keys
     * @return {Void}
     */
    _notifyVirtualProperties(keys?: string[]): string[] | undefined;
    /**
     * Gets the changes and error keys.
     */
    _rollbackKeys(): string[];
    /**
     * Deletes a key off an object and notifies observers.
     */
    _deleteKey(objName: string, key?: string): InternalMap;
    get(key: string): any;
    set<T>(key: string, value: T): void;
}
/**
 * Creates new changesets.
 */
export declare function changeset(obj: object, options?: Config): ValidatedChangeset;
export declare function Changeset(obj: object, options?: Config): ValidatedChangeset;
export {};
//# sourceMappingURL=validated.d.ts.map