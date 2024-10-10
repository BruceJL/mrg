/**
 * Handles both single key or nested string keys ('person.name')
 *
 * @method getDeep
 */
export default function getDeep<T extends Record<string, any>>(root: T, path: string | string[]): any;
/**
 * Returns subObject while skipping `Change` instances
 *
 * @method getSubObject
 */
export declare function getSubObject<T extends Record<string, any>>(root: T, path: string | string[]): any;
//# sourceMappingURL=get-deep.d.ts.map