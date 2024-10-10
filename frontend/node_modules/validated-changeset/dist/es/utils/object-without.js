/**
 * Merges all sources together, excluding keys in excludedKeys.
 *
 * @param  {string[]} excludedKeys
 * @param  {...object} sources
 * @return {object}
 */
export default function objectWithout(excludedKeys, ...sources) {
    return sources.reduce((acc, source) => {
        Object.keys(source)
            .filter((key) => excludedKeys.indexOf(key) === -1 || !source.hasOwnProperty(key))
            .forEach((key) => (acc[key] = source[key]));
        return acc;
    }, {});
}
//# sourceMappingURL=object-without.js.map