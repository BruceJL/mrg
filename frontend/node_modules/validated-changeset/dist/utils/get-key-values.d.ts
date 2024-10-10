import type { PublicErrors } from '../types';
/**
 * traverse through target and return leaf nodes with `value` property and key as 'person.name'
 * Only detects key paths with Changes
 *
 * @method getKeyValues
 * @return {Array} [{ 'person.name': value }]
 */
export declare function getKeyValues<T extends Record<string, any>>(obj: T, keysUpToValue?: Array<string>): Record<string, any>[];
/**
 * traverse through target and return leaf nodes with `value` property and key as 'person.name'
 *
 * @method getKeyErrorValues
 * @return {Array} [{ key: 'person.name', validation: '', value: '' }]
 */
export declare function getKeyErrorValues<T extends Record<string, any>>(obj: T, keysUpToValue?: Array<string>): PublicErrors;
//# sourceMappingURL=get-key-values.d.ts.map