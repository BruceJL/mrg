import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from '../applyDecoratedDescriptor-d3d95cf1.js';
import { _ as _defineProperty } from '../defineProperty-35ce617b.js';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';

var _class, _descriptor;
let Cell = (_class = class Cell {
  constructor(initialValue) {
    _initializerDefineProperty(this, "current", _descriptor, this);
    _defineProperty(this, "toggle", () => {
      assert(`toggle can only be used when 'current' is a boolean type`, typeof this.current === 'boolean' || this.current === undefined);
      this.current = !this.current;
    });
    _defineProperty(this, "update", updater => {
      this.current = updater(this.current);
    });
    _defineProperty(this, "set", nextValue => {
      this.current = nextValue;
    });
    if (initialValue !== undefined) {
      this.current = initialValue;
    }
  }

  /**
   * Toggles the value of `current` only if
   * `current` is a boolean -- errors otherwise
   */
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "current", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class);
/**
 * Small state utility for helping reduce the number of imports
 * when working with resources in isolation.
 *
 * The return value is an instance of a class with a single
 * `@tracked` property, `current`. If `current` is a boolean,
 * there is a `toggle` method available as well.
 *
 * For example, a Clock:
 *
 * ```js
 * import { resource, cell } from 'ember-resources';
 *
 * const Clock = resource(({ on }) => {
 *   let time = cell(new Date());
 *   let interval = setInterval(() => time.current = new Date(), 1000);
 *
 *   on.cleanup(() => clearInterval(interval));
 *
 *   let formatter = new Intl.DateTimeFormat('en-US', {
 *     hour: 'numeric',
 *     minute: 'numeric',
 *     second: 'numeric',
 *     hour12: true,
 *   });
 *
 *   return () => formatter.format(time.current);
 * });
 *
 * <template>
 *   It is: <time>{{Clock}}</time>
 * </template>
 * ```
 */
function cell(initialValue) {
  if (initialValue !== undefined) {
    return new Cell(initialValue);
  }
  return new Cell();
}

export { cell };
//# sourceMappingURL=cell.js.map
