interface Options {
    safeGet: any;
    safeSet: any;
    propertyIsUnsafe?: any;
    getKeys?: (record: Record<string, unknown>) => string[];
}
export declare function propertyIsUnsafe(target: any, key: string): boolean;
/**
 * goal is to mutate target with source's properties, ensuring we dont encounter
 * pitfalls of { ..., ... } spread syntax overwriting keys on objects that we merged
 *
 * This is also adjusted for Ember peculiarities.  Specifically `options.setPath` will allows us
 * to handle properties on Proxy objects (that aren't the target's own property)
 *
 * @method mergeDeep
 */
export default function mergeDeep(target: any, source: any, options?: Options): object | [any];
export {};
//# sourceMappingURL=merge-deep.d.ts.map