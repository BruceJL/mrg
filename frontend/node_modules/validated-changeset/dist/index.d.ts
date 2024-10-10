import Change, { getChangeValue, isChange } from './-private/change';
import { getKeyValues } from './utils/get-key-values';
import lookupValidator from './utils/validator-lookup';
import Err from './-private/err';
import normalizeObject from './utils/normalize-object';
import pureAssign from './utils/assign';
import isChangeset, { CHANGESET } from './utils/is-changeset';
import isObject from './utils/is-object';
import isPromise from './utils/is-promise';
import keyInObject from './utils/key-in-object';
import mergeNested from './utils/merge-nested';
import { buildOldValues } from './utils/build-old-values';
import objectWithout from './utils/object-without';
import take from './utils/take';
import mergeDeep, { propertyIsUnsafe } from './utils/merge-deep';
import setDeep from './utils/set-deep';
import getDeep from './utils/get-deep';
import { objectToArray, arrayToObject, isArrayObject } from './utils/array-object';
import type { Changes, Config, Content, Errors, IErr, IChangeset, INotifier, InternalMap, NewProperty, PrepareChangesFn, Snapshot, ValidationErr, ValidationResult, ValidatorAction, ValidatorMap } from './types';
import { ValidatedChangeset as ValidationChangeset, Changeset as ValidationChangesetFactory } from './validated';
export { ValidationChangeset, ValidationChangesetFactory, CHANGESET, Change, Err, isArrayObject, arrayToObject, objectToArray, buildOldValues, isChangeset, isObject, isChange, getChangeValue, isPromise, getKeyValues, keyInObject, lookupValidator, mergeNested, normalizeObject, objectWithout, pureAssign, take, mergeDeep, setDeep, getDeep, propertyIsUnsafe };
declare const CONTENT = "_content";
declare const PREVIOUS_CONTENT = "_previousContent";
declare const CHANGES = "_changes";
declare const ERRORS = "_errors";
declare const ERRORS_CACHE = "_errorsCache";
declare const VALIDATOR = "_validator";
declare const OPTIONS = "_options";
declare const RUNNING_VALIDATIONS = "_runningValidations";
declare function maybeUnwrapProxy(content: Content): any;
export declare class BufferedChangeset implements IChangeset {
    validateFn: ValidatorAction;
    validationMap: ValidatorMap;
    constructor(obj: object, validateFn?: ValidatorAction, validationMap?: ValidatorMap, options?: Config);
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
    [VALIDATOR]: ValidatorAction;
    [OPTIONS]: Config;
    [RUNNING_VALIDATIONS]: Record<string, any>;
    __changeset__: string;
    _eventedNotifiers: {};
    on(eventName: string, callback: (key: string) => unknown): INotifier;
    off(eventName: string, callback: (key: string) => unknown): INotifier;
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
    get _bareChanges(): Record<string, any>;
    /**
     * @property changes
     * @type {Array}
     */
    get changes(): Record<string, any>[];
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
     * Provides a function to run before emitting changes to the model. The
     * callback function must return a hash in the same shape:
     *
     * ```
     * changeset
     *   .prepare((changes) => {
     *     let modified = {};
     *
     *     for (let key in changes) {
     *       modified[underscore(key)] = changes[key];
     *     }
     *
     *    return modified; // { first_name: "Jim", last_name: "Bob" }
     *  })
     *  .execute(); // execute the changes
     * ```
     *
     * @method prepare
     */
    prepare(prepareChangesFn: PrepareChangesFn): this;
    /**
     * Executes the changeset if in a valid state.
     *
     * @method execute
     */
    execute(): this;
    unexecute(): this;
    /**
     * Executes the changeset and saves the underlying content.
     *
     * @method save
     * @param {Object} options optional object to pass to content save method
     */
    save(options?: object): Promise<IChangeset | any>;
    /**
     * Merges 2 valid changesets and returns a new changeset. Both changesets
     * must point to the same underlying object. The changeset target is the
     * origin. For example:
     *
     * ```
     * let changesetA = new Changeset(user, validatorFn);
     * let changesetB = new Changeset(user, validatorFn);
     * changesetA.set('firstName', 'Jim');
     * changesetB.set('firstName', 'Jimmy');
     * changesetB.set('lastName', 'Fallon');
     * let changesetC = changesetA.merge(changesetB);
     * changesetC.execute();
     * user.get('firstName'); // "Jimmy"
     * user.get('lastName'); // "Fallon"
     * ```
     *
     * @method merge
     */
    merge(changeset: this): this;
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
     * Discards changes/errors for the specified properly only.
     *
     * @public
     * @chainable
     * @method rollbackProperty
     * @param {String} key key to delete off of changes and errors
     * @return {Changeset}
     */
    rollbackProperty(key: string): this;
    /**
     * Validates the changeset immediately against the validationMap passed in.
     * If no key is passed into this method, it will validate all fields on the
     * validationMap and set errors accordingly. Will throw an error if no
     * validationMap is present.
     *
     * @method validate
     */
    validate(...validationKeys: string[]): Promise<any>;
    /**
     * Manually add an error to the changeset. If there is an existing
     * error or change for `key`, it will be overwritten.
     *
     * @method addError
     */
    addError<T>(key: string, error: IErr<T> | ValidationErr): ValidationErr | IErr<T>;
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
     * Unlike `Ecto.Changeset.cast`, `cast` will take allowed keys and
     * remove unwanted keys off of the changeset. For example, this method
     * can be used to only allow specified changes through prior to saving.
     *
     * @method cast
     */
    cast(allowed?: string[]): this;
    /**
     * Checks to see if async validator for a given key has not resolved.
     * If no key is provided it will check to see if any async validator is running.
     *
     * @method isValidating
     */
    isValidating(key?: string | void): boolean;
    /**
     * Validates a specific key
     *
     * @method _validateKey
     * @private
     */
    _validateKey<T>(key: string, value: T): Promise<ValidationResult | T | IErr<T>> | T | IErr<T> | ValidationResult;
    /**
     * Takes resolved validation and adds an error or simply returns the value
     *
     * @method _handleValidation
     * @private
     */
    _handleValidation<T>(validation: ValidationResult, { key, value }: NewProperty<T>): T | IErr<T> | ValidationErr;
    /**
     * runs the validator with the key and value
     *
     * @method _validate
     * @private
     */
    _validate(key: string, newValue: unknown, oldValue: unknown): ValidationResult | Promise<ValidationResult>;
    /**
     * Sets property on the changeset.
     */
    _setProperty<T>({ key, value, oldValue }: NewProperty<T>): void;
    /**
     * Increment or decrement the number of running validations for a
     * given key.
     */
    _setIsValidating(key: string, promise: Promise<ValidationResult>): void;
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
    _collectErrors(): Errors<any>;
    _isValidResult(result: ValidationResult): boolean;
    get(key: string): any;
    set<T>(key: string, value: T): void;
}
/**
 * Creates new changesets.
 */
export declare function changeset(obj: object, validateFn?: ValidatorAction, validationMap?: ValidatorMap | null | undefined, options?: Config): BufferedChangeset;
export declare class ValidatedChangeset {
    /**
     * Changeset factory class if you need to extend
     *
     * @class ValidatedChangeset
     * @constructor
     */
    constructor(obj: object, validateFn?: ValidatorAction, validationMap?: ValidatorMap | null | undefined, options?: Config);
}
export declare function Changeset(obj: object, validateFn?: ValidatorAction, validationMap?: ValidatorMap | null | undefined, options?: Config): BufferedChangeset;
//# sourceMappingURL=index.d.ts.map