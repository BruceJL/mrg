import { _ as _defineProperty } from '../../defineProperty-35ce617b.js';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { associateDestroyableChild } from '@ember/destroyable';
import { setHelperManager, capabilities } from '@ember/helper';
import { Resource } from './resource.js';

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
// export interface Resource<T extends ArgsWrapper = ArgsWrapper> extends InstanceType<
//   HelperLike<{
//     Args: {
//       Named: NonNullable<T['named']>;
//       Positional: NonNullable<T['positional']>
//     };
//     // Return: number
//   }>
// > {}

class ResourceManager {
  constructor(owner) {
    _defineProperty(this, "capabilities", capabilities('3.23', {
      hasValue: true,
      hasDestroyable: true
    }));
    this.owner = owner;
  }
  createHelper(Class, args) {
    let owner = this.owner;
    let instance;
    let cache = createCache(() => {
      if (instance === undefined) {
        instance = new Class(owner);
        associateDestroyableChild(cache, instance);
      }
      if (instance.modify) {
        instance.modify(args.positional, args.named);
      }
      return instance;
    });
    return cache;
  }
  getValue(cache) {
    let instance = getValue(cache);
    return instance;
  }
  getDestroyable(cache) {
    return cache;
  }
}
setHelperManager(owner => new ResourceManager(owner), Resource);
//# sourceMappingURL=manager.js.map
