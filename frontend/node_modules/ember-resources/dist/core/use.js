import { getValue } from '@glimmer/tracking/primitives/cache';
import { assert } from '@ember/debug';
import { associateDestroyableChild } from '@ember/destroyable';
import { invokeHelper } from '@ember/helper';
import { INTERNAL } from './function-based/types.js';
import { normalizeThunk } from './utils.js';

// @ts-ignore
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
function use(_prototype, key, descriptor) {
  if (!descriptor) return;
  assert(`@use can only be used with string-keys`, typeof key === 'string');
  let caches = new WeakMap();
  let {
    initializer
  } = descriptor;
  assert(`@use may only be used on initialized properties. For example, ` + `\`@use foo = resource(() => { ... })\` or ` + `\`@use foo = SomeResource.from(() => { ... });\``, initializer);

  // https://github.com/pzuraq/ember-could-get-used-to-this/blob/master/addon/index.js
  return {
    get() {
      let cache = caches.get(this);
      if (!cache) {
        let config = initializer.call(this);
        assert(`Expected initialized value under @use to have used either the \`resource\` wrapper function, or a \`Resource.from\` call`, INTERNAL in config);
        if (config.type === 'function-based') {
          cache = invokeHelper(this, config);
          caches.set(this, cache);
          associateDestroyableChild(this, cache);
        } else if (config.type === 'class-based') {
          let {
            definition,
            thunk
          } = config;
          cache = invokeHelper(this, definition, () => normalizeThunk(thunk));
          caches.set(this, cache);
          associateDestroyableChild(this, cache);
        }
        assert(`Failed to create cache for internal resource configuration object`, cache);
      }
      return getValue(cache);
    }
  } /* Thanks TS. */;
}

export { use };
//# sourceMappingURL=use.js.map
