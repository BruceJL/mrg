import { _ as _defineProperty } from '../../defineProperty-35ce617b.js';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { associateDestroyableChild, registerDestructor, destroy } from '@ember/destroyable';
import { capabilities } from '@ember/helper';

/**
 * Note, a function-resource receives on object, hooks.
 *    We have to build that manually in this helper manager
 */
class FunctionResourceManager {
  constructor(owner) {
    _defineProperty(this, "capabilities", capabilities('3.23', {
      hasValue: true,
      hasDestroyable: true
    }));
    this.owner = owner;
  }

  /**
   * Resources do not take args.
   * However, they can access tracked data
   */
  createHelper(config) {
    let {
      definition: fn
    } = config;
    /**
     * We have to copy the `fn` in case there are multiple
     * usages or invocations of the function.
     *
     * This copy is what we'll ultimately work with and eventually
     * destroy.
     */
    let thisFn = fn.bind(null);
    let previousFn;
    let cache = createCache(() => {
      if (previousFn) {
        destroy(previousFn);
      }
      let currentFn = thisFn.bind(null);
      associateDestroyableChild(thisFn, currentFn);
      previousFn = currentFn;
      let maybeValue = currentFn({
        on: {
          cleanup: destroyer => {
            registerDestructor(currentFn, destroyer);
          }
        },
        owner: this.owner
      });
      return maybeValue;
    });
    return {
      fn: thisFn,
      cache
    };
  }
  getValue({
    cache
  }) {
    let maybeValue = getValue(cache);
    if (typeof maybeValue === 'function') {
      return maybeValue();
    }
    return maybeValue;
  }
  getDestroyable({
    fn
  }) {
    return fn;
  }
}
const ResourceManagerFactory = owner => new FunctionResourceManager(owner);

export { ResourceManagerFactory };
//# sourceMappingURL=manager.js.map
