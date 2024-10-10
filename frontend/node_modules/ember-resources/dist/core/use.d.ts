interface Descriptor {
    initializer: () => unknown;
}
/**
 * The `@use` decorator has two responsibilities
 *    - abstract away the underlying reactivity configuration (invokeHelper)
 *       - by doing this, we get destruction-association properly configured so that
 *         when the host class is destroyed, if the resource has a destructor, it
 *         will be called during destruction
 *    - allows the return value of the resource to be "the" value of the property.
 *
 *
 * This `@use` decorator is needed for function-resources, and *not* needed for class-based
 * resources (for now).
 *
 * @example
 * ```js
 * import { resource, use } from 'ember-resources';
 *
 * class MyClass {
 *   @use data = resource(() => {
 *     return 2;
 *   });
 * }
 *
 * (new MyClass()).data === 2
 * ```
 */
declare function use(_prototype: object, key: string, descriptor?: Descriptor): void;
export { use };
