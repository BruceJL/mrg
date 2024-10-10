/**
 * Wraps a value in an Array.
 *
 * @public
 * @param  {Any} value
 */
export default function wrapInArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
}
//# sourceMappingURL=wrap.js.map