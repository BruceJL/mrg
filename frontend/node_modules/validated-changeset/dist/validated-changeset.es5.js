import structuredClone from '@ungap/structured-clone';

function isObject(val) {
    return (val !== null &&
        typeof val === 'object' &&
        !(val instanceof Date || val instanceof RegExp) &&
        !Array.isArray(val));
}

/* import { IChange } from '../types'; */
const VALUE = Symbol('__value__');
class Change {
    constructor(value) {
        this[VALUE] = value;
    }
}
// TODO: not sure why this function type guard isn't working
const isChange = (maybeChange) => isObject(maybeChange) && VALUE in maybeChange;
function getChangeValue(maybeChange) {
    if (isChange(maybeChange)) {
        return maybeChange[VALUE];
    }
}

class Err {
    constructor(value, validation) {
        this.value = value;
        this.validation = validation;
    }
}

/**
 * traverse through target and return leaf nodes with `value` property and key as 'person.name'
 * Only detects key paths with Changes
 *
 * @method getKeyValues
 * @return {Array} [{ 'person.name': value }]
 */
function getKeyValues(obj, keysUpToValue = []) {
    const map = [];
    for (let key in obj) {
        if (obj[key] && isObject(obj[key])) {
            if (isChange(obj[key])) {
                map.push({ key: [...keysUpToValue, key].join('.'), value: getChangeValue(obj[key]) });
            }
            else {
                map.push(...getKeyValues(obj[key], [...keysUpToValue, key]));
            }
        }
    }
    return map;
}
/**
 * traverse through target and return leaf nodes with `value` property and key as 'person.name'
 *
 * @method getKeyErrorValues
 * @return {Array} [{ key: 'person.name', validation: '', value: '' }]
 */
function getKeyErrorValues(obj, keysUpToValue = []) {
    let map = [];
    for (let key in obj) {
        if (obj[key] && isObject(obj[key])) {
            if (Object.prototype.hasOwnProperty.call(obj[key], 'value') &&
                obj[key] instanceof Err) {
                map.push({
                    key: [...keysUpToValue, key].join('.'),
                    validation: obj[key].validation,
                    value: obj[key].value
                });
            }
            else if (key !== 'value') {
                map.push(...getKeyErrorValues(obj[key], [...keysUpToValue, key]));
            }
        }
    }
    return map;
}

function isPromiseLike(obj) {
    return (!!obj &&
        !!obj.then &&
        !!obj.catch &&
        !!obj.finally &&
        typeof obj.then === 'function' &&
        typeof obj.catch === 'function' &&
        typeof obj.finally === 'function');
}
function isPromise(obj) {
    return isObject(obj) && isPromiseLike(obj);
}

/**
 * Rejects `true` values from an array of validations. Returns `true` when there
 * are no errors, or the error object if there are errors.
 *
 * @private
 * @param  {Array} validations
 * @return {Promise<boolean|Any>}
 */
async function handleValidationsAsync(validations) {
    try {
        const result = await Promise.all(validations);
        const maybeFailed = result.filter((val) => typeof val !== 'boolean' && val);
        return maybeFailed.length === 0 || maybeFailed;
    }
    catch (e) {
        return e;
    }
}
/**
 * Rejects `true` values from an array of validations. Returns `true` when there
 * are no errors, or the error object if there are errors.
 *
 * @private
 * @param  {Array} validations
 * @return {boolean|Any}
 */
function handleValidationsSync(validations) {
    const maybeFailed = validations.filter((val) => typeof val !== 'boolean' && val);
    return maybeFailed.length === 0 || maybeFailed;
}
/**
 * Handles an array of validators and returns Promise.all if any value is a
 * Promise.
 *
 * @public
 * @param  {Array} validators Array of validator functions
 * @param  {String} options.key
 * @param  {Any} options.newValue
 * @param  {Any} options.oldValue
 * @param  {Object} options.changes
 * @param  {Object} options.content
 * @return {Promise|boolean|Any}
 */
function handleMultipleValidations(validators, { key, newValue, oldValue, changes, content }) {
    let validations = Array.from(validators.map((validator) => {
        const isValidatorClass = (maybeClass) => !!maybeClass.validate;
        if (validator && isValidatorClass(validator)) {
            validator = validator.validate.bind(validator);
        }
        return validator(key, newValue, oldValue, changes, content);
    }));
    if (validations.some(isPromise)) {
        return Promise.all(validations).then(handleValidationsAsync);
    }
    return handleValidationsSync(validations);
}

/**
 * Handles both single key or nested string keys ('person.name')
 *
 * @method getDeep
 */
function getDeep(root, path) {
    let obj = root;
    if (path.indexOf('.') === -1) {
        return obj[path];
    }
    const parts = typeof path === 'string' ? path.split('.') : path;
    for (let i = 0; i < parts.length; i++) {
        if (obj === undefined || obj === null) {
            return undefined;
        }
        // next iteration has next level
        obj = obj[parts[i]];
    }
    return obj;
}
/**
 * Returns subObject while skipping `Change` instances
 *
 * @method getSubObject
 */
function getSubObject(root, path) {
    let obj = root;
    if (path.indexOf('.') === -1) {
        return obj[path];
    }
    const parts = typeof path === 'string' ? path.split('.') : path;
    for (let i = 0; i < parts.length; i++) {
        if (obj === undefined || obj === null) {
            return undefined;
        }
        if (isChange(obj[parts[i]])) {
            obj = getChangeValue(obj[parts[i]]);
        }
        else {
            obj = obj[parts[i]];
        }
    }
    return obj;
}

/**
 * returns a closure to lookup and validate k/v pairs set on a changeset
 *
 * @method lookupValidator
 * @param validationMap
 */
function lookupValidator(validationMap) {
    return ({ key, newValue, oldValue, changes, content }) => {
        const validations = validationMap || {};
        let validator = getDeep(validations, key);
        const isValidatorClass = (maybeClass) => !!maybeClass.validate;
        if (validator && isValidatorClass(validator)) {
            validator = validator.validate.bind(validator);
        }
        if (!validator || isObject(validator)) {
            return true;
        }
        let validation;
        if (Array.isArray(validator)) {
            validation = handleMultipleValidations(validator, {
                key,
                newValue,
                oldValue,
                changes,
                content
            });
        }
        else {
            validation = validator(key, newValue, oldValue, changes, content);
        }
        return isPromise(validation)
            ? validation.then((result) => {
                return result;
            })
            : validation;
    };
}

// this statefull class holds and notifies
class Notifier {
    constructor() {
        this.listeners = [];
    }
    addListener(callback) {
        this.listeners.push(callback);
        return () => this.removeListener(callback);
    }
    removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === callback) {
                this.listeners.splice(i, 1);
                return;
            }
        }
    }
    trigger(...args) {
        this.listeners.forEach((callback) => callback(...args));
    }
}

function notifierForEvent(object, eventName) {
    if (object._eventedNotifiers === undefined) {
        object._eventedNotifiers = {};
    }
    let notifier = object._eventedNotifiers[eventName];
    if (!notifier) {
        notifier = object._eventedNotifiers[eventName] = new Notifier();
    }
    return notifier;
}

function hasKey(record, path, safeGet) {
    const keys = path.split('.');
    let obj = record;
    for (const key of keys) {
        if (!obj || !Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
        obj = safeGet(obj, key);
        if (isChange(obj)) {
            obj = getChangeValue(obj);
        }
    }
    return true;
}
function pathInChanges(record, path, safeGet) {
    if (isChange(record)) {
        return false;
    }
    const keys = path.split('.');
    let obj = record;
    for (const key of keys) {
        if (!obj) {
            return false;
        }
        if (keys[keys.length - 1] !== key && isChange(safeGet(obj, key))) {
            return true;
        }
        obj = safeGet(obj, key);
    }
    return false;
}

/**
 * traverse through target and unset `value` from leaf key so can access normally
 * {
 *  name: Change {
 *    value: 'Charles'
 *  }
 * }
 *
 * to
 *
 * {
 *  name: 'Charles'
 * }
 *
 * Shallow copy here is fine because we are swapping out the leaf nested object
 * rather than mutating a property in something with reference
 *
 * @method normalizeObject
 * @param {Object} target
 * @return {Object}
 */
function normalizeObject(target, isObj = isObject) {
    if (!target || !isObj(target)) {
        return target;
    }
    if (isChange(target)) {
        return getChangeValue(target);
    }
    let obj = Object.assign({}, target);
    for (let key in obj) {
        const next = obj[key];
        if (next && isObj(next)) {
            if (isChange(next)) {
                obj[key] = getChangeValue(next);
            }
            else {
                try {
                    JSON.stringify(next);
                }
                catch (e) {
                    break;
                }
                obj[key] = normalizeObject(next);
            }
        }
    }
    return obj;
}

function hasChanges(changes) {
    for (let key in changes) {
        if (isChange(changes[key])) {
            return true;
        }
        if (isObject(changes[key])) {
            const isTruthy = hasChanges(changes[key]);
            if (isTruthy) {
                return isTruthy;
            }
        }
    }
    return false;
}

let getOwnPropertyDescriptors;
if (Object.getOwnPropertyDescriptors !== undefined) {
    getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
}
else {
    getOwnPropertyDescriptors = function (obj) {
        let desc = {};
        Object.keys(obj).forEach((key) => {
            desc[key] = Object.getOwnPropertyDescriptor(obj, key);
        });
        return desc;
    };
}
// keep getters and setters
function pureAssign(...objects) {
    return objects.reduce((acc, obj) => {
        return Object.defineProperties(acc, getOwnPropertyDescriptors(obj));
    }, {});
}

function flatten(validatorMap, obj, keys, keysUpToFunction = []) {
    for (let key of keys) {
        const value = validatorMap[key];
        if (typeof value.validate === 'function') {
            // class with .validate function
            obj[key] = value;
        }
        else if (isObject(value)) {
            flatten(value, obj, Object.keys(value), [...keysUpToFunction, key]);
        }
        else if (typeof value === 'function') {
            const dotSeparatedKeys = [...keysUpToFunction, key].join('.');
            obj[dotSeparatedKeys] = value;
        }
        else if (Array.isArray(value)) {
            const isAllFuncs = value.every((item) => typeof item === 'function' || typeof item.validate === 'function');
            if (isAllFuncs) {
                const dotSeparatedKeys = [...keysUpToFunction, key].join('.');
                obj[dotSeparatedKeys] = value;
            }
        }
    }
    return obj;
}
/**
 * With nested validations, we flatten to a dot separated 'user.email': validationFunc
 * Once doing so, validation will happen with a single level key or dot separated key
 *
 * @method flattenValidations
 * @return {object}
 */
function flattenValidations(validatorMap) {
    if (!validatorMap) {
        return {};
    }
    let obj = {};
    return flatten(validatorMap, obj, Object.keys(validatorMap));
}

const CHANGESET = '__CHANGESET__';
function isChangeset(changeset) {
    return changeset && changeset['__changeset__'] === CHANGESET;
}

function keyInObject(obj, key) {
    let [baseKey, ...keys] = key.split('.');
    if (!baseKey || !(baseKey in obj)) {
        return false;
    }
    if (!keys.length) {
        return baseKey in obj;
    }
    let value = obj[baseKey];
    if (value !== null && typeof value === 'object') {
        return keyInObject(obj[baseKey], keys.join('.'));
    }
    return false;
}

function isArrayObject(obj) {
    if (!obj)
        return false;
    let maybeIndicies = Object.keys(obj);
    return maybeIndicies.every((key) => Number.isInteger(parseInt(key, 10)));
}
function arrayToObject(array) {
    return array.reduce((obj, item, index) => {
        obj[index] = item;
        return obj;
    }, {});
}
function objectToArray(obj) {
    let result = [];
    for (let [index, value] of Object.entries(obj)) {
        result[parseInt(index, 10)] = value;
    }
    return result;
}

function split(path) {
    const keys = path.split('.');
    return keys;
}
function findSiblings(target, keys) {
    const [leafKey] = keys.slice(-1);
    const remaining = Object.keys(target)
        .filter((k) => k !== leafKey)
        .reduce((acc, key) => {
        acc[key] = target[key];
        return acc;
    }, Object.create(null));
    return Object.assign({}, remaining);
}
function isValidKey(key) {
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}
/**
 * TODO: consider
 * https://github.com/emberjs/ember.js/blob/822452c4432620fc67a777aba3b150098fd6812d/packages/%40ember/-internals/metal/lib/property_set.ts
 *
 * Handles both single path or nested string paths ('person.name')
 *
 * @method setDeep
 */
function setDeep(target, path, value, options = { safeSet: undefined, safeGet: undefined }) {
    const keys = split(path).filter(isValidKey);
    // We will mutate target and through complex reference, we will mutate the orig
    let orig = target;
    options.safeSet =
        options.safeSet ||
            function (obj, key, value) {
                return (obj[key] = value);
            };
    options.safeGet =
        options.safeGet ||
            function (obj, key) {
                return obj ? obj[key] : obj;
            };
    if (keys.length === 1) {
        options.safeSet(target, path, value);
        return target;
    }
    for (let i = 0; i < keys.length; i++) {
        let prop = keys[i];
        if (Array.isArray(target) && parseInt(prop, 10) < 0) {
            throw new Error('Negative indices are not allowed as arrays do not serialize values at negative indices');
        }
        const isObj = isObject(options.safeGet(target, prop));
        const isArray = Array.isArray(options.safeGet(target, prop));
        const isComplex = isObj || isArray;
        if (!isComplex) {
            options.safeSet(target, prop, {});
        }
        else if (isComplex && isChange(options.safeGet(target, prop))) {
            let changeValue = getChangeValue(options.safeGet(target, prop));
            if (isObject(changeValue)) {
                // if an object, we don't want to lose sibling keys
                const siblings = findSiblings(changeValue, keys);
                const resolvedValue = isChange(value) ? getChangeValue(value) : value;
                const isArrayLike = Array.isArray(target) || isArrayObject(target);
                const nestedKeys = isArrayLike
                    ? keys.slice(i + 1, keys.length).join('.') // remove first key segment as well as the index
                    : keys.slice(1, keys.length).join('.'); // remove first key segment
                let newValue;
                // if the resolved value was deleted (via setting to null or undefined),
                // there is no need to setDeep. We can short-circuit that and set
                // newValue directly because of the shallow value
                if (isArrayLike && undefined === resolvedValue) {
                    newValue = resolvedValue;
                }
                else if (i === keys.length - 1) {
                    // If last key, this is the final value
                    newValue = resolvedValue;
                }
                else {
                    newValue = setDeep(siblings, nestedKeys, resolvedValue, options);
                }
                options.safeSet(target, prop, new Change(newValue));
                // since we are done with the `path`, we can terminate the for loop and return control
                break;
            }
            else {
                // we don't want to merge new changes with a Change instance higher up in the obj tree
                // thus we nullify the current Change instance to
                options.safeSet(target, prop, {});
            }
        }
        // last iteration, set and return control
        if (i === keys.length - 1) {
            options.safeSet(target, prop, value);
            break;
        }
        // assign next level of object for next loop
        target = options.safeGet(target, prop);
    }
    return orig;
}

const { keys } = Object;
/**
 * Given an array of objects, merge their keys into a new object and
 * return the new object.
 */
function mergeNested(...objects) {
    let finalObj = {};
    objects.forEach((obj) => keys(obj).forEach((key) => setDeep(finalObj, key, obj[key])));
    return finalObj;
}

function buildOldValues(content, changes, getDeep) {
    const obj = Object.create(null);
    for (let change of changes) {
        obj[change.key] = getDeep(content, change.key);
    }
    return obj;
}

function isNonNullObject(value) {
    return !!value && typeof value === 'object';
}
function isSpecial(value) {
    let stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}
function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
}
function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols
        ? Object.getOwnPropertySymbols(target).filter((symbol) => {
            return target.propertyIsEnumerable(symbol);
        })
        : [];
}
function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
    try {
        return property in object;
    }
    catch (_) {
        return false;
    }
}
// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
    return (propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
        // unsafe if they exist up the prototype chain and also unsafe if they're nonenumerable.
        !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key)));
}
/**
 * DFS - traverse depth first until find object with `value`.  Then go back up tree and try on next key
 * Need to exhaust all possible avenues.
 *
 * @method buildPathToValue
 */
function buildPathToValue(source, options, kv, possibleKeys) {
    Object.keys(source).forEach((key) => {
        let possible = source[key];
        if (possible && isChange(possible)) {
            kv[[...possibleKeys, key].join('.')] = getChangeValue(possible);
            return;
        }
        if (possible && typeof possible === 'object') {
            buildPathToValue(possible, options, kv, [...possibleKeys, key]);
        }
    });
    return kv;
}
/**
 * `source` will always have a leaf key `value` with the property we want to set
 *
 * @method mergeTargetAndSource
 */
function mergeTargetAndSource(target, source, options) {
    options.getKeys(source).forEach((key) => {
        // proto poisoning.  So can set by nested key path 'person.name'
        if (options.propertyIsUnsafe(target, key)) {
            // if safeSet, we will find keys leading up to value and set
            if (options.safeSet) {
                const kv = buildPathToValue(source, options, {}, []);
                // each key will be a path nested to the value `person.name.other`
                if (Object.keys(kv).length > 0) {
                    // we found some keys!
                    for (key in kv) {
                        const val = kv[key];
                        options.safeSet(target, key, val);
                    }
                }
            }
            return;
        }
        // else safe key on object
        if (propertyIsOnObject(target, key) &&
            isMergeableObject(source[key]) &&
            !isChange(source[key])) {
            options.safeSet(target, key, mergeDeep(options.safeGet(target, key), options.safeGet(source, key), options));
        }
        else {
            let next = source[key];
            if (next && isChange(next)) {
                return options.safeSet(target, key, getChangeValue(next));
            }
            return options.safeSet(target, key, normalizeObject(next));
        }
    });
    return target;
}
/**
 * goal is to mutate target with source's properties, ensuring we dont encounter
 * pitfalls of { ..., ... } spread syntax overwriting keys on objects that we merged
 *
 * This is also adjusted for Ember peculiarities.  Specifically `options.setPath` will allows us
 * to handle properties on Proxy objects (that aren't the target's own property)
 *
 * @method mergeDeep
 */
function mergeDeep(target, source, options = {
    safeGet: undefined,
    safeSet: undefined,
    propertyIsUnsafe: undefined,
    getKeys: undefined
}) {
    options.getKeys = options.getKeys || getKeys;
    options.propertyIsUnsafe = options.propertyIsUnsafe || propertyIsUnsafe;
    options.safeGet =
        options.safeGet ||
            function (obj, key) {
                return obj[key];
            };
    options.safeSet =
        options.safeSet ||
            function (obj, key, value) {
                return (obj[key] = value);
            };
    let sourceIsArray = Array.isArray(source);
    let targetIsArray = Array.isArray(target);
    let sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
        let sourceIsArrayLike = isArrayObject(source);
        if (targetIsArray && sourceIsArrayLike) {
            return objectToArray(mergeTargetAndSource(arrayToObject(target), source, options));
        }
        return source;
    }
    else if (sourceIsArray) {
        return source;
    }
    else if (target === null || target === undefined) {
        /**
         * If the target was set to null or undefined, we always want to return the source.
         * There is nothing to merge.
         *
         * Without this explicit check, typeof null === typeof {any object-like thing}
         * which means that mergeTargetAndSource will be called, and you can't merge with null
         */
        return source;
    }
    else {
        return mergeTargetAndSource(target, source, options);
    }
}

const objectProxyHandler = {
    /**
     * Priority of access - changes, content, then check node
     * @property get
     */
    get(node, key) {
        if (typeof key === 'symbol') {
            return;
        }
        let childValue = node.safeGet(node.changes, key);
        if (isChange(childValue)) {
            return getChangeValue(childValue);
        }
        if (isObject(childValue)) {
            let childNode = node.children[key];
            if (childNode === undefined && node.content) {
                let childContent = node.safeGet(node.content, key);
                // cache it
                childNode = node.children[key] = new ObjectTreeNode(childValue, childContent, node.safeGet);
            }
            // return proxy if object so we can trap further access to changes or content
            if (childNode) {
                return childNode.proxy;
            }
        }
        if (typeof childValue !== 'undefined') {
            // primitive
            return childValue;
        }
        else if (node.content) {
            const nodeContent = node.content;
            if (node.safeGet(nodeContent, key) !== undefined) {
                return node.safeGet(nodeContent, key);
            }
        }
        if (typeof node[key] === 'function' || node.hasOwnProperty(key)) {
            return node[key];
        }
    },
    ownKeys(node) {
        return Reflect.ownKeys(node.changes);
    },
    getOwnPropertyDescriptor(node, prop) {
        return Reflect.getOwnPropertyDescriptor(node.changes, prop);
    },
    has(node, prop) {
        return Reflect.has(node.changes, prop);
    },
    set(node, key, value) {
        // dont want to set private properties on changes (usually found on outside actors)
        if (key.startsWith('_')) {
            return Reflect.set(node, key, value);
        }
        return Reflect.set(node.changes, key, new Change(value));
    }
};
function defaultSafeGet(obj, key) {
    return obj[key];
}
class ObjectTreeNode {
    constructor(changes = {}, content = {}, safeGet = defaultSafeGet, isObject$1 = isObject) {
        this.safeGet = safeGet;
        this.isObject = isObject$1;
        this.changes = changes;
        this.content = content;
        this.proxy = new Proxy(this, objectProxyHandler);
        this.children = Object.create(null);
    }
    get(key) {
        return this.safeGet(this.changes, key);
    }
    set(key, value) {
        return setDeep(this.changes, key, value);
    }
    unwrap() {
        let changes = this.changes;
        if (isObject(changes)) {
            changes = normalizeObject(changes, this.isObject);
            const content = this.content;
            if (isObject(content)) {
                changes = normalizeObject(changes, this.isObject);
                return Object.assign(Object.assign({}, content), changes);
            }
            else if (Array.isArray(content)) {
                changes = normalizeObject(changes, this.isObject);
                return objectToArray(mergeDeep(arrayToObject(content), changes));
            }
        }
        return changes;
    }
}

/**
 * Merges all sources together, excluding keys in excludedKeys.
 *
 * @param  {string[]} excludedKeys
 * @param  {...object} sources
 * @return {object}
 */
function objectWithout(excludedKeys, ...sources) {
    return sources.reduce((acc, source) => {
        Object.keys(source)
            .filter((key) => excludedKeys.indexOf(key) === -1 || !source.hasOwnProperty(key))
            .forEach((key) => (acc[key] = source[key]));
        return acc;
    }, {});
}

function take(originalObj = {}, keysToTake = []) {
    let newObj = {};
    for (let key in originalObj) {
        if (keysToTake.indexOf(key) !== -1) {
            newObj[key] = originalObj[key];
        }
    }
    return newObj;
}

const { keys: keys$1 } = Object;
const CONTENT = '_content';
const PREVIOUS_CONTENT = '_previousContent';
const CHANGES = '_changes';
// const ORIGINAL = '_original';
const ERRORS = '_errors';
const ERRORS_CACHE = '_errorsCache';
const OPTIONS = '_options';
const AFTER_ROLLBACK_EVENT = 'afterRollback';
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
function newFormat(obj, original, getDeep) {
    let newFormat = {};
    for (let item of obj) {
        const { key, value } = item;
        newFormat[key] = {
            current: value,
            original: getDeep(original, key)
        };
    }
    return newFormat;
}
// This is intended to provide an alternative changeset structure compatible with `yup`
// This slims down the set of features, including removed APIs and `validate` returns just the `validate(obj)` method call and requires users to manually add errors.
class ValidatedChangeset {
    constructor(obj, options = {}) {
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
        this[OPTIONS] = options;
        this[ERRORS] = {};
        this[ERRORS_CACHE] = {};
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
    /**
     * @property changes
     * @type {Array}
     */
    get changes() {
        let obj = this[CHANGES];
        let original = this[CONTENT];
        // foo: {
        //  original: 0,
        //  current: 1,
        // }
        return newFormat(getKeyValues(obj), original, this.getDeep);
    }
    /**
     * @property errors
     * @type {Array}
     */
    get errors() {
        let obj = this[ERRORS];
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
        this._setProperty({ key, value, oldValue });
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
            oldContent = buildOldValues(content, getKeyValues(changes), this.getDeep);
            // we want mutation on original object
            // @tracked
            this[CONTENT] = this.mergeDeep(content, changes, {
                safeGet: this.safeGet,
                safeSet: this.safeSet
            });
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
        let errorKeys = keys$1(this[ERRORS]);
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
     * @method validate
     */
    async validate(cb) {
        const changes = this[CHANGES];
        const content = this[CONTENT];
        // return an object that does not poison original model and provides user with full set of data + changes to validate
        return cb(this.mergeDeep(structuredClone(content), changes));
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
        return newError;
    }
    /**
     * @method removeError
     */
    removeError(key) {
        // Remove `key` to errors map.
        let errors = this[ERRORS];
        // @tracked
        this[ERRORS] = this.setDeep(errors, key, null, { safeSet: this.safeSet });
        this[ERRORS] = this._deleteKey(ERRORS, key);
        this[ERRORS_CACHE] = this[ERRORS];
    }
    /**
     * @method removeError
     */
    removeErrors() {
        // @tracked
        this[ERRORS] = {};
        this[ERRORS_CACHE] = this[ERRORS];
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
            errors: keys$1(errors).reduce((newObj, key) => {
                let e = errors[key];
                newObj[key] = { value: e.value, validation: e.validation };
                return newObj;
            }, {})
        };
    }
    getChangesForSnapshot(changes) {
        return keys$1(changes).reduce((newObj, key) => {
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
        let newErrors = keys$1(errors).reduce((newObj, key) => {
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
        return keys$1(changes).reduce((newObj, key) => {
            newObj[key] = this.getChangeForProp(changes[key]);
            return newObj;
        }, {});
    }
    getChangeForProp(value) {
        if (!isObject(value)) {
            return new Change(value);
        }
        return keys$1(value).reduce((newObj, key) => {
            newObj[key] = this.getChangeForProp(value[key]);
            return newObj;
        }, {});
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
        return [...new Set([...keys$1(changes), ...keys$1(errors)])];
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
function changeset(obj, options) {
    return new ValidatedChangeset(obj, options);
}
function Changeset(obj, options) {
    const c = changeset(obj, options);
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

const { keys: keys$2 } = Object;
const CONTENT$1 = '_content';
const PREVIOUS_CONTENT$1 = '_previousContent';
const CHANGES$1 = '_changes';
const ERRORS$1 = '_errors';
const ERRORS_CACHE$1 = '_errorsCache';
const VALIDATOR = '_validator';
const OPTIONS$1 = '_options';
const RUNNING_VALIDATIONS = '_runningValidations';
const BEFORE_VALIDATION_EVENT = 'beforeValidation';
const AFTER_VALIDATION_EVENT = 'afterValidation';
const AFTER_ROLLBACK_EVENT$1 = 'afterRollback';
const defaultValidatorFn = () => true;
const defaultOptions = { skipValidate: false };
const DEBUG$1 = process.env.NODE_ENV !== 'production';
function assert$1(msg, property) {
    if (DEBUG$1) {
        if (!property) {
            throw new Error(msg);
        }
    }
}
function maybeUnwrapProxy$1(content) {
    return content;
}
class BufferedChangeset {
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
        this.maybeUnwrapProxy = maybeUnwrapProxy$1;
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
        this[CONTENT$1] = obj;
        this[PREVIOUS_CONTENT$1] = undefined;
        this[CHANGES$1] = {};
        this[VALIDATOR] = validateFn;
        this[OPTIONS$1] = pureAssign(defaultOptions, JSON.parse(JSON.stringify(options)));
        this[RUNNING_VALIDATIONS] = {};
        let validatorMapKeys = this.validationMap ? keys$2(this.validationMap) : [];
        if (this[OPTIONS$1].initValidate && validatorMapKeys.length > 0) {
            let errors = this._collectErrors();
            this[ERRORS$1] = errors;
            this[ERRORS_CACHE$1] = errors;
        }
        else {
            this[ERRORS$1] = {};
            this[ERRORS_CACHE$1] = {};
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
        let obj = this[CHANGES$1];
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
        let obj = this[CHANGES$1];
        // [{ key, value }, ...]
        return getKeyValues(obj);
    }
    /**
     * @property errors
     * @type {Array}
     */
    get errors() {
        let obj = this[ERRORS$1];
        // [{ key, validation, value }, ...]
        return getKeyErrorValues(obj);
    }
    get change() {
        let obj = this[CHANGES$1];
        if (hasChanges(this[CHANGES$1])) {
            return normalizeObject(obj);
        }
        return {};
    }
    get error() {
        return this[ERRORS$1];
    }
    get data() {
        return this[CONTENT$1];
    }
    /**
     * @property isValid
     * @type {Array}
     */
    get isValid() {
        return getKeyErrorValues(this[ERRORS$1]).length === 0;
    }
    /**
     * @property isPristine
     * @type {Boolean}
     */
    get isPristine() {
        let validationKeys = Object.keys(this[CHANGES$1]);
        const userChangesetKeys = this[OPTIONS$1].changesetKeys;
        if (Array.isArray(userChangesetKeys) && userChangesetKeys.length) {
            validationKeys = validationKeys.filter((k) => userChangesetKeys.includes(k));
        }
        if (validationKeys.length === 0) {
            return true;
        }
        return !hasChanges(this[CHANGES$1]);
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
        let config = this[OPTIONS$1];
        let changesetKeys = config.changesetKeys;
        if (Array.isArray(changesetKeys) && changesetKeys.length > 0) {
            const hasKey = changesetKeys.find((chKey) => key.match(chKey));
            if (!hasKey) {
                return;
            }
        }
        let content = this[CONTENT$1];
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
        let normalisedContent = pureAssign(this[CONTENT$1], {});
        return `changeset:${normalisedContent.toString()}`;
    }
    /**
     * String representation for the changeset.
     */
    toString() {
        let normalisedContent = pureAssign(this[CONTENT$1], {});
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
        assert$1('Callback to `changeset.prepare` must return an object', this.isObject(preparedChanges));
        let newObj = {};
        if (this.isObject(preparedChanges)) {
            let newChanges = keys$2(preparedChanges).reduce((newObj, key) => {
                newObj[key] = new Change(preparedChanges[key]);
                return newObj;
            }, newObj);
            // @tracked
            this[CHANGES$1] = newChanges;
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
            let content = this[CONTENT$1];
            let changes = this[CHANGES$1];
            // keep old values in case of error and we want to rollback
            oldContent = buildOldValues(content, this.changes, this.getDeep);
            // we want mutation on original object
            // @tracked
            this[CONTENT$1] = this.mergeDeep(content, changes);
        }
        // trigger any registered callbacks by same keyword as method name
        this.trigger('execute');
        this[CHANGES$1] = {};
        this[PREVIOUS_CONTENT$1] = oldContent;
        return this;
    }
    unexecute() {
        if (this[PREVIOUS_CONTENT$1]) {
            this[CONTENT$1] = this.mergeDeep(this[CONTENT$1], this[PREVIOUS_CONTENT$1], {
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
        let content = this[CONTENT$1];
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
        let content = this[CONTENT$1];
        assert$1('Cannot merge with a non-changeset', isChangeset(changeset));
        assert$1('Cannot merge with a changeset of different content', changeset[CONTENT$1] === content);
        if (this.isPristine && changeset.isPristine) {
            return this;
        }
        let c1 = this[CHANGES$1];
        let c2 = changeset[CHANGES$1];
        let e1 = this[ERRORS$1];
        let e2 = changeset[ERRORS$1];
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        let newChangeset = new ValidatedChangeset$1(content, this[VALIDATOR]); // ChangesetDef
        let newErrors = objectWithout(keys$2(c2), e1);
        let newChanges = objectWithout(keys$2(e2), c1);
        let mergedErrors = mergeNested(newErrors, e2);
        let mergedChanges = mergeNested(newChanges, c2);
        newChangeset[ERRORS$1] = mergedErrors;
        newChangeset[CHANGES$1] = mergedChanges;
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
        this[CHANGES$1] = {};
        this[ERRORS$1] = {};
        this[ERRORS_CACHE$1] = {};
        this._notifyVirtualProperties(keys);
        this.trigger(AFTER_ROLLBACK_EVENT$1);
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
            this[ERRORS$1] = this._deleteKey(ERRORS$1, key);
            this[ERRORS_CACHE$1] = this[ERRORS$1];
            if (errorKeys.indexOf(key) > -1) {
                this[CHANGES$1] = this._deleteKey(CHANGES$1, key);
            }
        }
        else {
            this._notifyVirtualProperties();
            this[ERRORS$1] = {};
            this[ERRORS_CACHE$1] = this[ERRORS$1];
            // if on CHANGES hash, rollback those as well
            errorKeys.forEach((errKey) => {
                this[CHANGES$1] = this._deleteKey(CHANGES$1, errKey);
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
        this[CHANGES$1] = this._deleteKey(CHANGES$1, key);
        // @tracked
        this[ERRORS$1] = this._deleteKey(ERRORS$1, key);
        this[ERRORS_CACHE$1] = this[ERRORS$1];
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
        if (keys$2(this.validationMap).length === 0 && !validationKeys.length) {
            return Promise.resolve(null);
        }
        validationKeys =
            validationKeys.length > 0
                ? validationKeys
                : keys$2(flattenValidations(this.validationMap));
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
            assert$1('Error must have value.', error.hasOwnProperty('value') || error.value !== undefined);
            assert$1('Error must have validation.', error.hasOwnProperty('validation'));
            newError = new Err(error.value, error.validation);
        }
        else {
            let value = this[key];
            newError = new Err(value, error);
        }
        // Add `key` to errors map.
        let errors = this[ERRORS$1];
        // @tracked
        this[ERRORS$1] = this.setDeep(errors, key, newError, { safeSet: this.safeSet });
        this[ERRORS_CACHE$1] = this[ERRORS$1];
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
        let errors = this[ERRORS$1];
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
        this[ERRORS$1] = this.setDeep(errors, key, newError, { safeSet: this.safeSet });
        this[ERRORS_CACHE$1] = this[ERRORS$1];
        return { value, validation };
    }
    /**
     * Creates a snapshot of the changeset's errors and changes.
     *
     * @method snapshot
     */
    snapshot() {
        let changes = this[CHANGES$1];
        let errors = this[ERRORS$1];
        return {
            changes: this.getChangesForSnapshot(changes),
            errors: keys$2(errors).reduce((newObj, key) => {
                let e = errors[key];
                newObj[key] = { value: e.value, validation: e.validation };
                return newObj;
            }, {})
        };
    }
    getChangesForSnapshot(changes) {
        return keys$2(changes).reduce((newObj, key) => {
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
        let newErrors = keys$2(errors).reduce((newObj, key) => {
            let e = errors[key];
            newObj[key] = new Err(e.value, e.validation);
            return newObj;
        }, {});
        // @tracked
        this[CHANGES$1] = newChanges;
        // @tracked
        this[ERRORS$1] = newErrors;
        this[ERRORS_CACHE$1] = this[ERRORS$1];
        this._notifyVirtualProperties();
        return this;
    }
    getChangesFromSnapshot(changes) {
        return keys$2(changes).reduce((newObj, key) => {
            newObj[key] = this.getChangeForProp(changes[key]);
            return newObj;
        }, {});
    }
    getChangeForProp(value) {
        if (!isObject(value)) {
            return new Change(value);
        }
        return keys$2(value).reduce((newObj, key) => {
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
        let changes = this[CHANGES$1];
        if (Array.isArray(allowed) && allowed.length === 0) {
            return this;
        }
        let changeKeys = keys$2(changes);
        let validKeys = changeKeys.filter((key) => allowed.includes(key));
        let casted = take(changes, validKeys);
        // @tracked
        this[CHANGES$1] = casted;
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
        let ks = keys$2(runningValidations);
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
        let content = this[CONTENT$1];
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
        this[ERRORS$1] = this._deleteKey(ERRORS_CACHE$1, key);
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
        let content = this[CONTENT$1];
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
        let changes = this[CHANGES$1];
        // Happy path: update change map.
        if (!isEqual$1(value, oldValue) || oldValue === undefined) {
            // @tracked
            let result = this.setDeep(changes, key, new Change(value), {
                safeSet: this.safeSet
            });
            this[CHANGES$1] = result;
        }
        else if (keyInObject(changes, key)) {
            // @tracked
            // remove key if setting back to original
            this[CHANGES$1] = this._deleteKey(CHANGES$1, key);
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
        let changes = this[CHANGES$1];
        let errors = this[ERRORS$1];
        return [...new Set([...keys$2(changes), ...keys$2(errors)])];
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
        let validationKeys = keys$2(flattenValidations(this.validationMap));
        return validationKeys.reduce((acc, key) => {
            let content = this[CONTENT$1];
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
        let changes = this[CHANGES$1];
        let content = this[CONTENT$1];
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
function changeset$1(obj, validateFn, validationMap, options) {
    return new BufferedChangeset(obj, validateFn, validationMap, options);
}
class ValidatedChangeset$1 {
    /**
     * Changeset factory class if you need to extend
     *
     * @class ValidatedChangeset
     * @constructor
     */
    constructor(obj, validateFn, validationMap, options) {
        const c = changeset$1(obj, validateFn, validationMap, options);
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
function Changeset$1(obj, validateFn, validationMap, options) {
    const c = changeset$1(obj, validateFn, validationMap, options);
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
function isEqual$1(v1, v2) {
    if (v1 instanceof Date && v2 instanceof Date) {
        return v1.getTime() === v2.getTime();
    }
    return v1 === v2;
}

export { BufferedChangeset, CHANGESET, Change, Changeset$1 as Changeset, Err, ValidatedChangeset$1 as ValidatedChangeset, ValidatedChangeset as ValidationChangeset, Changeset as ValidationChangesetFactory, arrayToObject, buildOldValues, changeset$1 as changeset, getChangeValue, getDeep, getKeyValues, isArrayObject, isChange, isChangeset, isObject, isPromise, keyInObject, lookupValidator, mergeDeep, mergeNested, normalizeObject, objectToArray, objectWithout, propertyIsUnsafe, pureAssign, setDeep, take };
//# sourceMappingURL=validated-changeset.es5.js.map
