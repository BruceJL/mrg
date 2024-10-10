export default function keyInObject(obj, key) {
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
//# sourceMappingURL=key-in-object.js.map