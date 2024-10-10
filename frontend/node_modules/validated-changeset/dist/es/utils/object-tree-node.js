import isObjectFn from './is-object';
import setDeep from './set-deep';
import Change, { getChangeValue, isChange } from '../-private/change';
import normalizeObject from './normalize-object';
import { objectToArray, arrayToObject } from './array-object';
import mergeDeep from './merge-deep';
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
        if (isObjectFn(childValue)) {
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
    constructor(changes = {}, content = {}, safeGet = defaultSafeGet, isObject = isObjectFn) {
        this.safeGet = safeGet;
        this.isObject = isObject;
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
        if (isObjectFn(changes)) {
            changes = normalizeObject(changes, this.isObject);
            const content = this.content;
            if (isObjectFn(content)) {
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
export { ObjectTreeNode };
//# sourceMappingURL=object-tree-node.js.map