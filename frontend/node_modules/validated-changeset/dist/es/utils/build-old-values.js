export function buildOldValues(content, changes, getDeep) {
    const obj = Object.create(null);
    for (let change of changes) {
        obj[change.key] = getDeep(content, change.key);
    }
    return obj;
}
//# sourceMappingURL=build-old-values.js.map