import isObject from './is-object';
function isPromiseLike(obj) {
    return (!!obj &&
        !!obj.then &&
        !!obj.catch &&
        !!obj.finally &&
        typeof obj.then === 'function' &&
        typeof obj.catch === 'function' &&
        typeof obj.finally === 'function');
}
export default function isPromise(obj) {
    return isObject(obj) && isPromiseLike(obj);
}
//# sourceMappingURL=is-promise.js.map