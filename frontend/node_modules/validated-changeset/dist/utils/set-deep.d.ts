interface Options {
    safeSet?: any;
    safeGet?: any;
}
/**
 * TODO: consider
 * https://github.com/emberjs/ember.js/blob/822452c4432620fc67a777aba3b150098fd6812d/packages/%40ember/-internals/metal/lib/property_set.ts
 *
 * Handles both single path or nested string paths ('person.name')
 *
 * @method setDeep
 */
export default function setDeep(target: any, path: string, value: unknown, options?: Options): any;
export {};
//# sourceMappingURL=set-deep.d.ts.map