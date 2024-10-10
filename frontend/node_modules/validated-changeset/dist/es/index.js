import Change, { getChangeValue, isChange } from './-private/change';
import { getKeyValues, getKeyErrorValues } from './utils/get-key-values';
import lookupValidator from './utils/validator-lookup';
import { notifierForEvent } from './-private/evented';
import Err from './-private/err';
import { hasKey, pathInChanges } from './utils/has-key';
import normalizeObject from './utils/normalize-object';
import { hasChanges } from './utils/has-changes';
import pureAssign from './utils/assign';
import { flattenValidations } from './utils/flatten-validations';
import isChangeset, { CHANGESET } from './utils/is-changeset';
import isObject from './utils/is-object';
import isPromise from './utils/is-promise';
import keyInObject from './utils/key-in-object';
import mergeNested from './utils/merge-nested';
import { buildOldValues } from './utils/build-old-values';
import { ObjectTreeNode } from './utils/object-tree-node';
import objectWithout from './utils/object-without';
import take from './utils/take';
import mergeDeep, { propertyIsUnsafe } from './utils/merge-deep';
import setDeep from './utils/set-deep';
import getDeep, { getSubObject } from './utils/get-deep';
import { objectToArray, arrayToObject, isArrayObject } from './utils/array-object';
import { ValidatedChangeset as ValidationChangeset, Changeset as ValidationChangesetFactory } from './validated';
export { ValidationChangeset, ValidationChangesetFactory, CHANGESET, Change, Err, isArrayObject, arrayToObject, objectToArray, buildOldValues, isChangeset, isObject, isChange, getChangeValue, isPromise, getKeyValues, keyInObject, lookupValidator, mergeNested, normalizeObject, objectWithout, pureAssign, take, mergeDeep, setDeep, getDeep, propertyIsUnsafe };
const { keys } = Object;
const CONTENT = '_content';
const PREVIOUS_CONTENT = '_previousContent';
const CHANGES = '_changes';
const ERRORS = '_errors';
const ERRORS_CACHE = '_errorsCache';
const VALIDATOR = '_validator';
const OPTIONS = '_options';
const RUNNING_VALIDATIONS = '_runningValidations';
const BEFORE_VALIDATION_EVENT = 'beforeValidation';
const AFTER_VALIDATION_EVENT = 'afterValidation';
const AFTER_ROLLBACK_EVENT = 'afterRollback';
const defaultValidatorFn = () => true;
const defaultOptions = { skipValidate: false };
const DEBUG = process.env.NODE_ENV !== 'production';
function assert(msg, property) {
    if (DEBUG) {
        if (!property) {
            throw new Error(msg);
        }
    }
}
function maybeUnwrapProxy(content) {
    return content;
}
export class BufferedChangeset {
    constructor(obj, validateFn = defaultValidatorFn, validationMap = {}, options = {}) {
        this.validateFn = validateFn;
        this.validationMap = validationMap;
        this.__changeset__ = CHANGESET;
        this._eventedNotifiers = {};
        /**
         * @property isObject
         * @override
         */
        this.isObject = isObject;
        /**
         * @property maybeUnwrapProxy
         * @override
         */
        this.maybeUnwrapProxy = maybeUnwrapProxy;
        /**
         * @property setDeep
         * @override
         */
        this.setDeep = setDeep;
        /**
         * @property getDeep
         * @override
         */
        this.getDeep = getDeep;
        /**
         * @property mergeDeep
         * @override
         */
        this.mergeDeep = mergeDeep;
        this[CONTENT] = obj;
        this[PREVIOUS_CONTENT] = undefined;
        this[CHANGES] = {};
        this[VALIDATOR] = validateFn;
        this[OPTIONS] = pureAssign(defaultOptions, JSON.parse(JSON.stringify(options)));
        this[RUNNING_VALIDATIONS] = {};
        let validatorMapKeys = this.validationMap ? keys(this.validationMap) : [];
        if (this[OPTIONS].initValidate && validatorMapKeys.length > 0) {
            let errors = this._collectErrors();
            this[ERRORS] = errors;
            this[ERRORS_CACHE] = errors;
        }
        else {
            this[ERRORS] = {};
            this[ERRORS_CACHE] = {};
        }
    }
    on(eventName, callback) {
        const notifier = notifierForEvent(this, eventName);
        return notifier.addListener(callback);
    }
    off(eventName, callback) {
        const notifier = notifierForEvent(this, eventName);
        return notifier.removeListener(callback);
    }
    trigger(eventName, ...args) {
        const notifier = notifierForEvent(this, eventName);
        if (notifier) {
            notifier.trigger(...args);
        }
    }
    /**
     * @property safeGet
     * @override
     */
    safeGet(obj, key) {
        return obj[key];
    }
    /**
     * @property safeSet
     * @override
     */
    safeSet(obj, key, value) {
        return (obj[key] = value);
    }
    get _bareChanges() {
        let obj = this[CHANGES];
        return getKeyValues(obj).reduce((newObj, { key, value }) => {
            newObj[key] = value;
            return newObj;
        }, Object.create(null));
    }
    /**
     * @property changes
     * @type {Array}
     */
    get changes() {
        let obj = this[CHANGES];
        // [{ key, value }, ...]
        return getKeyValues(obj);
    }
    /**
     * @property errors
     * @type {Array}
     */
    get errors() {
        let obj = this[ERRORS];
        // [{ key, validation, value }, ...]
        return getKeyErrorValues(obj);
    }
    get change() {
        let obj = this[CHANGES];
        if (hasChanges(this[CHANGES])) {
            return normalizeObject(obj);
        }
        return {};
    }
    get error() {
        return this[ERRORS];
    }
    get data() {
        return this[CONTENT];
    }
    /**
     * @property isValid
     * @type {Array}
     */
    get isValid() {
        return getKeyErrorValues(this[ERRORS]).length === 0;
    }
    /**
     * @property isPristine
     * @type {Boolean}
     */
    get isPristine() {
        let validationKeys = Object.keys(this[CHANGES]);
        const userChangesetKeys = this[OPTIONS].changesetKeys;
        if (Array.isArray(userChangesetKeys) && userChangesetKeys.length) {
            validationKeys = validationKeys.filter((k) => userChangesetKeys.includes(k));
        }
        if (validationKeys.length === 0) {
            return true;
        }
        return !hasChanges(this[CHANGES]);
    }
    /**
     * @property isInvalid
     * @type {Boolean}
     */
    get isInvalid() {
        return !this.isValid;
    }
    /**
     * @property isDirty
     * @type {Boolean}
     */
    get isDirty() {
        return !this.isPristine;
    }
    /**
     * Stores change on the changeset.
     * This approximately works just like the Ember API
     *
     * @method setUnknownProperty
     */
    setUnknownProperty(key, value) {
        let config = this[OPTIONS];
        let changesetKeys = config.changesetKeys;
        if (Array.isArray(changesetKeys) && changesetKeys.length > 0) {
            const hasKey = changesetKeys.find((chKey) => key.match(chKey));
            if (!hasKey) {
                return;
            }
        }
        let content = this[CONTENT];
        let oldValue = this.safeGet(content, key);
        let skipValidate = config.skipValidate;
        if (skipValidate) {
            this._setProperty({ key, value, oldValue });
            this._handleValidation(true, { key, value });
            return;
        }
        this._setProperty({ key, value, oldValue });
        this._validateKey(key, value);
    }
    /**
     * String representation for the changeset.
     */
    get [Symbol.toStringTag]() {
        let normalisedContent = pureAssign(this[CONTENT], {});
        return `changeset:${normalisedContent.toString()}`;
    }
    /**
     * String representation for the changeset.
     */
    toString() {
        let normalisedContent = pureAssign(this[CONTENT], {});
        return `changeset:${normalisedContent.toString()}`;
    }
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
    prepare(prepareChangesFn) {
        let changes = this._bareChanges;
        let preparedChanges = prepareChangesFn(changes);
        assert('Callback to `changeset.prepare` must return an object', this.isObject(preparedChanges));
        let newObj = {};
        if (this.isObject(preparedChanges)) {
            let newChanges = keys(preparedChanges).reduce((newObj, key) => {
                newObj[key] = new Change(preparedChanges[key]);
                return newObj;
            }, newObj);
            // @tracked
            this[CHANGES] = newChanges;
        }
        return this;
    }
    /**
     * Executes the changeset if in a valid state.
     *
     * @method execute
     */
    execute() {
        let oldContent;
        if (this.isValid && this.isDirty) {
            let content = this[CONTENT];
            let changes = this[CHANGES];
            // keep old values in case of error and we want to rollback
            oldContent = buildOldValues(content, this.changes, this.getDeep);
            // we want mutation on original object
            // @tracked
            this[CONTENT] = this.mergeDeep(content, changes);
        }
        // trigger any registered callbacks by same keyword as method name
        this.trigger('execute');
        this[CHANGES] = {};
        this[PREVIOUS_CONTENT] = oldContent;
        return this;
    }
    unexecute() {
        if (this[PREVIOUS_CONTENT]) {
            this[CONTENT] = this.mergeDeep(this[CONTENT], this[PREVIOUS_CONTENT], {
                safeGet: this.safeGet,
                safeSet: this.safeSet
            });
        }
        return this;
    }
    /**
     * Executes the changeset and saves the underlying content.
     *
     * @method save
     * @param {Object} options optional object to pass to content save method
     */
    async save(options) {
        let content = this[CONTENT];
        let savePromise = Promise.resolve(this);
        this.execute();
        if (typeof content.save === 'function') {
            savePromise = content.save(options);
        }
        else if (typeof this.safeGet(content, 'save') === 'function') {
            // we might be getting this off a proxy object.  For example, when a
            // belongsTo relationship (a proxy on the parent model)
            // another way would be content(belongsTo).content.save
            let maybePromise = this.maybeUnwrapProxy(content).save();
            if (maybePromise) {
                savePromise = maybePromise;
            }
        }
        try {
            const result = await savePromise;
            // cleanup changeset
            this.rollback();
            return result;
        }
        catch (e) {
            throw e;
        }
    }
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
    merge(changeset) {
        let content = this[CONTENT];
        assert('Cannot merge with a non-changeset', isChangeset(changeset));
        assert('Cannot merge with a changeset of different content', changeset[CONTENT] === content);
        if (this.isPristine && changeset.isPristine) {
            return this;
        }
        let c1 = this[CHANGES];
        let c2 = changeset[CHANGES];
        let e1 = this[ERRORS];
        let e2 = changeset[ERRORS];
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        let newChangeset = new ValidatedChangeset(content, this[VALIDATOR]); // ChangesetDef
        let newErrors = objectWithout(keys(c2), e1);
        let newChanges = objectWithout(keys(e2), c1);
        let mergedErrors = mergeNested(newErrors, e2);
        let mergedChanges = mergeNested(newChanges, c2);
        newChangeset[ERRORS] = mergedErrors;
        newChangeset[CHANGES] = mergedChanges;
        newChangeset._notifyVirtualProperties();
        return newChangeset;
    }
    /**
     * Returns the changeset to its pristine state, and discards changes and
     * errors.
     *
     * @method rollback
     */
    rollback() {
        // Get keys before reset.
        let keys = this._rollbackKeys();
        // Reset.
        this[CHANGES] = {};
        this[ERRORS] = {};
        this[ERRORS_CACHE] = {};
        this._notifyVirtualProperties(keys);
        this.trigger(AFTER_ROLLBACK_EVENT);
        return this;
    }
    /**
     * Discards any errors, keeping only valid changes.
     *
     * @public
     * @chainable
     * @method rollbackInvalid
     * @param {String} key optional key to rollback invalid values
     * @return {Changeset}
     */
    rollbackInvalid(key) {
        let errorKeys = this.errors.map(({ key }) => key);
        if (key) {
            this._notifyVirtualProperties([key]);
            // @tracked
            this[ERRORS] = this._deleteKey(ERRORS, key);
            this[ERRORS_CACHE] = this[ERRORS];
            if (errorKeys.indexOf(key) > -1) {
                this[CHANGES] = this._deleteKey(CHANGES, key);
            }
        }
        else {
            this._notifyVirtualProperties();
            this[ERRORS] = {};
            this[ERRORS_CACHE] = this[ERRORS];
            // if on CHANGES hash, rollback those as well
            errorKeys.forEach((errKey) => {
                this[CHANGES] = this._deleteKey(CHANGES, errKey);
            });
        }
        return this;
    }
    /**
     * Discards changes/errors for the specified properly only.
     *
     * @public
     * @chainable
     * @method rollbackProperty
     * @param {String} key key to delete off of changes and errors
     * @return {Changeset}
     */
    rollbackProperty(key) {
        // @tracked
        this[CHANGES] = this._deleteKey(CHANGES, key);
        // @tracked
        this[ERRORS] = this._deleteKey(ERRORS, key);
        this[ERRORS_CACHE] = this[ERRORS];
        return this;
    }
    /**
     * Validates the changeset immediately against the validationMap passed in.
     * If no key is passed into this method, it will validate all fields on the
     * validationMap and set errors accordingly. Will throw an error if no
     * validationMap is present.
     *
     * @method validate
     */
    async validate(...validationKeys) {
        if (keys(this.validationMap).length === 0 && !validationKeys.length) {
            return Promise.resolve(null);
        }
        validationKeys =
            validationKeys.length > 0
                ? validationKeys
                : keys(flattenValidations(this.validationMap));
        let maybePromise = validationKeys.map((key) => {
            const value = this[key];
            const resolvedValue = value instanceof ObjectTreeNode ? value.unwrap() : value;
            return this._validateKey(key, resolvedValue);
        });
        return Promise.all(maybePromise);
    }
    /**
     * Manually add an error to the changeset. If there is an existing
     * error or change for `key`, it will be overwritten.
     *
     * @method addError
     */
    addError(key, error) {
        // Construct new `Err` instance.
        let newError;
        const isIErr = (error) => this.isObject(error) && !Array.isArray(error);
        if (isIErr(error)) {
            assert('Error must have value.', error.hasOwnProperty('value') || error.value !== undefined);
            assert('Error must have validation.', error.hasOwnProperty('validation'));
            newError = new Err(error.value, error.validation);
        }
        else {
            let value = this[key];
            newError = new Err(value, error);
        }
        // Add `key` to errors map.
        let errors = this[ERRORS];
        // @tracked
        this[ERRORS] = this.setDeep(errors, key, newError, { safeSet: this.safeSet });
        this[ERRORS_CACHE] = this[ERRORS];
        // Return passed-in `error`.
        return error;
    }
    /**
     * Manually push multiple errors to the changeset as an array.
     * key maybe in form 'name.short' so need to go deep
     *
     * @method pushErrors
     */
    pushErrors(key, ...newErrors) {
        let errors = this[ERRORS];
        let existingError = this.getDeep(errors, key) || new Err(null, []);
        let validation = existingError.validation;
        let value = this[key];
        if (!Array.isArray(validation) && Boolean(validation)) {
            existingError.validation = [validation];
        }
        let v = existingError.validation;
        validation = [...v, ...newErrors];
        let newError = new Err(value, validation);
        // @tracked
        this[ERRORS] = this.setDeep(errors, key, newError, { safeSet: this.safeSet });
        this[ERRORS_CACHE] = this[ERRORS];
        return { value, validation };
    }
    /**
     * Creates a snapshot of the changeset's errors and changes.
     *
     * @method snapshot
     */
    snapshot() {
        let changes = this[CHANGES];
        let errors = this[ERRORS];
        return {
            changes: this.getChangesForSnapshot(changes),
            errors: keys(errors).reduce((newObj, key) => {
                let e = errors[key];
                newObj[key] = { value: e.value, validation: e.validation };
                return newObj;
            }, {})
        };
    }
    getChangesForSnapshot(changes) {
        return keys(changes).reduce((newObj, key) => {
            newObj[key] = isChange(changes[key])
                ? getChangeValue(changes[key])
                : this.getChangesForSnapshot(changes[key]);
            return newObj;
        }, {});
    }
    /**
     * Restores a snapshot of changes and errors. This overrides existing
     * changes and errors.
     *
     * @method restore
     */
    restore({ changes, errors }) {
        let newChanges = this.getChangesFromSnapshot(changes);
        let newErrors = keys(errors).reduce((newObj, key) => {
            let e = errors[key];
            newObj[key] = new Err(e.value, e.validation);
            return newObj;
        }, {});
        // @tracked
        this[CHANGES] = newChanges;
        // @tracked
        this[ERRORS] = newErrors;
        this[ERRORS_CACHE] = this[ERRORS];
        this._notifyVirtualProperties();
        return this;
    }
    getChangesFromSnapshot(changes) {
        return keys(changes).reduce((newObj, key) => {
            newObj[key] = this.getChangeForProp(changes[key]);
            return newObj;
        }, {});
    }
    getChangeForProp(value) {
        if (!isObject(value)) {
            return new Change(value);
        }
        return keys(value).reduce((newObj, key) => {
            newObj[key] = this.getChangeForProp(value[key]);
            return newObj;
        }, {});
    }
    /**
     * Unlike `Ecto.Changeset.cast`, `cast` will take allowed keys and
     * remove unwanted keys off of the changeset. For example, this method
     * can be used to only allow specified changes through prior to saving.
     *
     * @method cast
     */
    cast(allowed = []) {
        let changes = this[CHANGES];
        if (Array.isArray(allowed) && allowed.length === 0) {
            return this;
        }
        let changeKeys = keys(changes);
        let validKeys = changeKeys.filter((key) => allowed.includes(key));
        let casted = take(changes, validKeys);
        // @tracked
        this[CHANGES] = casted;
        return this;
    }
    /**
     * Checks to see if async validator for a given key has not resolved.
     * If no key is provided it will check to see if any async validator is running.
     *
     * @method isValidating
     */
    isValidating(key) {
        let runningValidations = this[RUNNING_VALIDATIONS];
        let ks = keys(runningValidations);
        if (key) {
            return ks.includes(key);
        }
        return ks.length > 0;
    }
    /**
     * Validates a specific key
     *
     * @method _validateKey
     * @private
     */
    _validateKey(key, value) {
        let content = this[CONTENT];
        let oldValue = this.getDeep(content, key);
        let validation = this._validate(key, value, oldValue);
        this.trigger(BEFORE_VALIDATION_EVENT, key);
        // TODO: Address case when Promise is rejected.
        if (isPromise(validation)) {
            this._setIsValidating(key, validation);
            let running = this[RUNNING_VALIDATIONS];
            let promises = Object.entries(running);
            return Promise.all(promises).then(() => {
                return validation
                    .then((resolvedValidation) => {
                    delete running[key];
                    return this._handleValidation(resolvedValidation, { key, value });
                })
                    .then((result) => {
                    this.trigger(AFTER_VALIDATION_EVENT, key);
                    return result;
                });
            });
        }
        let result = this._handleValidation(validation, { key, value });
        this.trigger(AFTER_VALIDATION_EVENT, key);
        return result;
    }
    /**
     * Takes resolved validation and adds an error or simply returns the value
     *
     * @method _handleValidation
     * @private
     */
    _handleValidation(validation, { key, value }) {
        // Happy path: remove `key` from error map.
        // @tracked
        // ERRORS_CACHE to avoid backtracking Ember assertion.
        this[ERRORS] = this._deleteKey(ERRORS_CACHE, key);
        // Error case.
        if (!this._isValidResult(validation)) {
            return this.addError(key, { value, validation });
        }
        return value;
    }
    /**
     * runs the validator with the key and value
     *
     * @method _validate
     * @private
     */
    _validate(key, newValue, oldValue) {
        let validator = this[VALIDATOR];
        let content = this[CONTENT];
        if (typeof validator === 'function') {
            let validationResult = validator({
                key,
                newValue,
                oldValue,
                changes: this.change,
                content
            });
            if (validationResult === undefined) {
                // no validator function found for key
                return true;
            }
            return validationResult;
        }
        return true;
    }
    /**
     * Sets property on the changeset.
     */
    _setProperty({ key, value, oldValue }) {
        let changes = this[CHANGES];
        // Happy path: update change map.
        if (!isEqual(value, oldValue) || oldValue === undefined) {
            // @tracked
            let result = this.setDeep(changes, key, new Change(value), {
                safeSet: this.safeSet
            });
            this[CHANGES] = result;
        }
        else if (keyInObject(changes, key)) {
            // @tracked
            // remove key if setting back to original
            this[CHANGES] = this._deleteKey(CHANGES, key);
        }
    }
    /**
     * Increment or decrement the number of running validations for a
     * given key.
     */
    _setIsValidating(key, promise) {
        let running = this[RUNNING_VALIDATIONS];
        this.setDeep(running, key, promise);
    }
    /**
     * Notifies virtual properties set on the changeset of a change.
     * You can specify which keys are notified by passing in an array.
     *
     * @private
     * @param {Array} keys
     * @return {Void}
     */
    _notifyVirtualProperties(keys) {
        if (!keys) {
            keys = this._rollbackKeys();
        }
        return keys;
    }
    /**
     * Gets the changes and error keys.
     */
    _rollbackKeys() {
        let changes = this[CHANGES];
        let errors = this[ERRORS];
        return [...new Set([...keys(changes), ...keys(errors)])];
    }
    /**
     * Deletes a key off an object and notifies observers.
     */
    _deleteKey(objName, key = '') {
        let obj = this[objName];
        let keys = key.split('.');
        if (keys.length === 1 && obj.hasOwnProperty(key)) {
            delete obj[key];
        }
        else if (obj[keys[0]]) {
            let [base, ...remaining] = keys;
            let previousNode = obj;
            let currentNode = obj[base];
            let currentKey = base;
            // find leaf and delete from map
            while (this.isObject(currentNode) && currentKey) {
                let curr = currentNode;
                if (isChange(curr) || typeof curr.value !== 'undefined' || curr.validation) {
                    delete previousNode[currentKey];
                }
                currentKey = remaining.shift();
                previousNode = currentNode;
                if (currentKey) {
                    currentNode = currentNode[currentKey];
                }
            }
        }
        return obj;
    }
    _collectErrors() {
        let validationKeys = keys(flattenValidations(this.validationMap));
        return validationKeys.reduce((acc, key) => {
            let content = this[CONTENT];
            let value = this.getDeep(content, key);
            let resolvedValue = value instanceof ObjectTreeNode ? value.unwrap() : value;
            let result = this._validate(key, resolvedValue, null);
            if (!this._isValidResult(result)) {
                let errorResult = result;
                let validationError = new Err(value, errorResult);
                this.setDeep(acc, key, validationError, { safeSet: this.safeSet });
            }
            return acc;
        }, {});
    }
    _isValidResult(result) {
        return result === true || (Array.isArray(result) && result.length === 1 && result[0] === true);
    }
    get(key) {
        // 'person'
        // 'person.username'
        let [baseKey, ...remaining] = key.split('.');
        let changes = this[CHANGES];
        let content = this[CONTENT];
        if (Object.prototype.hasOwnProperty.call(changes, baseKey)) {
            const changesValue = this.getDeep(changes, key);
            const isObject = this.isObject(changesValue);
            if (!isObject && changesValue !== undefined) {
                // if safeGet returns a primitive, then go ahead return
                return changesValue;
            }
        }
        // At this point, we may have a changes object, a dot separated key, or a need to access the `key`
        // on `this` or `content`
        if (Object.prototype.hasOwnProperty.call(changes, baseKey) && hasChanges(changes)) {
            let baseChanges = changes[baseKey];
            // 'user.name'
            const normalizedBaseChanges = normalizeObject(baseChanges);
            if (this.isObject(normalizedBaseChanges)) {
                const result = this.maybeUnwrapProxy(this.getDeep(normalizedBaseChanges, remaining.join('.')));
                // need to do this inside of Change object
                // basically anything inside of a Change object that is undefined means it was removed
                if (typeof result === 'undefined' &&
                    pathInChanges(changes, key, this.safeGet) &&
                    !hasKey(changes, key, this.safeGet) &&
                    this.getDeep(content, key)) {
                    return;
                }
                if (this.isObject(result)) {
                    if (isChange(result)) {
                        return getChangeValue(result);
                    }
                    const baseContent = this.safeGet(content, baseKey) || {};
                    const subContent = this.getDeep(baseContent, remaining.join('.'));
                    const subChanges = getSubObject(changes, key);
                    // give back an object that can further retrieve changes and/or content
                    const tree = new ObjectTreeNode(subChanges, subContent, this.getDeep, this.isObject);
                    return tree.proxy;
                }
                else if (typeof result !== 'undefined') {
                    return result;
                }
            }
            // this comes after the isObject check to ensure we don't lose remaining keys
            if (isChange(baseChanges) && remaining.length === 0) {
                return getChangeValue(baseChanges);
            }
        }
        // return getters/setters/methods on BufferedProxy instance
        if (baseKey in this || key in this) {
            return this.getDeep(this, key);
        }
        const subContent = this.maybeUnwrapProxy(this.getDeep(content, key));
        if (this.isObject(subContent)) {
            let subChanges = this.getDeep(changes, key);
            if (!subChanges) {
                // if no changes, we need to add the path to the existing changes (mutate)
                // so further access to nested keys works
                subChanges = this.getDeep(this.setDeep(changes, key, {}), key);
            }
            // may still access a value on the changes or content objects
            const tree = new ObjectTreeNode(subChanges, subContent, this.getDeep, this.isObject);
            return tree.proxy;
        }
        else if (Array.isArray(subContent)) {
            let subChanges = this.getDeep(changes, key);
            if (!subChanges) {
                // return array of contents. Dont need to worry about further access sibling keys in array case
                return subContent;
            }
            if (isObject(subChanges)) {
                if (isObject(subContent)) {
                    subChanges = normalizeObject(subChanges, this.isObject);
                    return Object.assign(Object.assign({}, subContent), subChanges);
                }
                else if (Array.isArray(subContent)) {
                    subChanges = normalizeObject(subChanges, this.isObject);
                    return objectToArray(mergeDeep(arrayToObject(subContent), subChanges));
                }
            }
            return subChanges;
        }
        return subContent;
    }
    set(key, value) {
        if (this.hasOwnProperty(key) || keyInObject(this, key)) {
            this[key] = value;
        }
        else {
            this.setUnknownProperty(key, value);
        }
    }
}
/**
 * Creates new changesets.
 */
export function changeset(obj, validateFn, validationMap, options) {
    return new BufferedChangeset(obj, validateFn, validationMap, options);
}
export class ValidatedChangeset {
    /**
     * Changeset factory class if you need to extend
     *
     * @class ValidatedChangeset
     * @constructor
     */
    constructor(obj, validateFn, validationMap, options) {
        const c = changeset(obj, validateFn, validationMap, options);
        return new Proxy(c, {
            get(targetBuffer, key /*, receiver*/) {
                const res = targetBuffer.get(key.toString());
                return res;
            },
            set(targetBuffer, key, value /*, receiver*/) {
                targetBuffer.set(key.toString(), value);
                return true;
            }
        });
    }
}
export function Changeset(obj, validateFn, validationMap, options) {
    const c = changeset(obj, validateFn, validationMap, options);
    return new Proxy(c, {
        get(targetBuffer, key /*, receiver*/) {
            const res = targetBuffer.get(key.toString());
            return res;
        },
        set(targetBuffer, key, value /*, receiver*/) {
            targetBuffer.set(key.toString(), value);
            return true;
        }
    });
}
// determine if two values are equal
function isEqual(v1, v2) {
    if (v1 instanceof Date && v2 instanceof Date) {
        return v1.getTime() === v2.getTime();
    }
    return v1 === v2;
}
//# sourceMappingURL=index.js.map