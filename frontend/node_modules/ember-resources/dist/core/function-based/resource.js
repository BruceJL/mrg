import { assert } from '@ember/debug';
import { setHelperManager } from '@ember/helper';
import { ResourceManagerFactory } from './manager.js';
import { INTERNAL } from './types.js';
import { wrapForPlainUsage } from './utils.js';

/**
 */
function resource(context, setup) {
  if (!setup) {
    assert(`When using \`resource\` with @use, ` + `the first argument to \`resource\` must be a function. ` + `Instead, a ${typeof context} was received.`, typeof context === 'function');
    let internalConfig = {
      definition: context,
      type: 'function-based',
      [INTERNAL]: true
    };

    /**
     * Functions have a different identity every time they are defined.
     * The primary purpose of the `resource` wrapper is to individually
     * register each function with our helper manager.
     */
    setHelperManager(ResourceManagerFactory, internalConfig);

    /**
     * With only one argument, we have to do a bunch of lying to
     * TS, because we need a special object to pass to `@use`
     *
     * Add secret key to help @use assert against
     * using vanilla functions as resources without the resource wrapper
     *
     */
    return internalConfig;
  }
  assert(`Mismatched argument typs passed to \`resource\`. ` + `Expected the first arg, the context, to be a type of object. This is usually the \`this\`. ` + `Received ${typeof context} instead.`, typeof context === 'object');
  assert(`Mismatched argument type passed to \`resource\`. ` + `Expected the second arg to be a function but instead received ${typeof setup}.`, typeof setup === 'function');
  let internalConfig = {
    definition: setup,
    type: 'function-based',
    [INTERNAL]: true
  };
  setHelperManager(ResourceManagerFactory, internalConfig);
  return wrapForPlainUsage(context, internalConfig);
}

export { resource };
//# sourceMappingURL=resource.js.map
