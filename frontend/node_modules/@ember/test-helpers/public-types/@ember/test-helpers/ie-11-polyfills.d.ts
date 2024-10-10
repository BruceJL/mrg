/**
 * Polyfills Array.prototype.find for ie11 without mocking the app during test execution
 * @param {array} array to find an element
 * @param {predicate} predicate function to find the element
 * @returns {(number | string | array | function)} found element inside the array
 */
export declare function find<T>(array: Array<T>, predicate: Function): T | undefined;
/**
 * Polyfills Array.from for ie11 without mocking the app during test execution
 * @param {array} nodeList like data structure(e.g. NodeList)
 * @returns {array} parameter converted to a JS array
 */
export declare function toArray<T extends Node>(nodeList: NodeListOf<T>): T[];
//# sourceMappingURL=ie-11-polyfills.d.ts.map