import setDeep from './set-deep';
const { keys } = Object;
/**
 * Given an array of objects, merge their keys into a new object and
 * return the new object.
 */
export default function mergeNested(...objects) {
    let finalObj = {};
    objects.forEach((obj) => keys(obj).forEach((key) => setDeep(finalObj, key, obj[key])));
    return finalObj;
}
//# sourceMappingURL=merge-nested.js.map