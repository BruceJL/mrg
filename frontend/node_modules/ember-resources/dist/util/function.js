import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from '../applyDecoratedDescriptor-d3d95cf1.js';
import { _ as _defineProperty } from '../defineProperty-35ce617b.js';
import { _ as _classExtractFieldDescriptor, a as _classPrivateFieldGet } from '../classPrivateFieldGet-53072de4.js';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';
import '@glimmer/tracking/primitives/cache';
import '@ember/destroyable';
import '@ember/helper';
import { resource } from '../core/function-based/resource.js';

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
  }
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
  _classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}

var _class, _descriptor, _descriptor2, _descriptor3, _fn, _hooks, _initialValue;
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function trackedFunction(...passedArgs) {
  let [context] = passedArgs;
  let initialValue;
  let fn;
  assert(`Expected second argument to useFunction to either be an initialValue or the function to run`, passedArgs[1] !== undefined);
  if (hasNoInitialValue(passedArgs)) {
    fn = passedArgs[1];
  } else {
    initialValue = passedArgs[1];
    fn = passedArgs[2];
  }
  return resource(context, hooks => {
    let state = new State(fn, hooks, initialValue);
    state.retry();
    return state;
  });
}

/**
 * State container that represents the asynchrony of a `trackedFunction`
 */
let State = (_class = (_fn = /*#__PURE__*/new WeakMap(), _hooks = /*#__PURE__*/new WeakMap(), _initialValue = /*#__PURE__*/new WeakMap(), class State {
  constructor(fn, hooks, initialValue) {
    _initializerDefineProperty(this, "isResolved", _descriptor, this);
    _initializerDefineProperty(this, "resolvedValue", _descriptor2, this);
    _initializerDefineProperty(this, "error", _descriptor3, this);
    _classPrivateFieldInitSpec(this, _fn, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _hooks, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _initialValue, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "retry", async () => {
      try {
        let notQuiteValue = _classPrivateFieldGet(this, _fn).call(this, _classPrivateFieldGet(this, _hooks));
        let promise = Promise.resolve(notQuiteValue);
        waitForPromise(promise);
        let result = await promise;
        this.error = undefined;
        this.resolvedValue = result;
      } catch (e) {
        this.error = e;
      } finally {
        this.isResolved = true;
      }
    });
    _classPrivateFieldSet(this, _fn, fn);
    _classPrivateFieldSet(this, _hooks, hooks);
    _classPrivateFieldSet(this, _initialValue, initialValue);
  }
  get value() {
    return this.resolvedValue || _classPrivateFieldGet(this, _initialValue) || null;
  }
  get isPending() {
    return !this.isResolved;
  }
  get isLoading() {
    return this.isPending;
  }
  get isError() {
    return Boolean(this.error);
  }

  /**
   * Will re-invoke the function passed to `trackedFunction`
   * this will also re-set some properties on the `State` instance.
   * This is the same `State` instance as before, as the `State` instance
   * is tied to the `fn` passed to `trackedFunction`
   *
   * `error` or `resolvedValue` will remain as they were previously
   * until this promise resolves, and then they'll be updated to the new values.
   */
}), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "isResolved", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return false;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "resolvedValue", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "error", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class);

/**
 * @private
 *
 * type-guard
 */
function hasNoInitialValue(args) {
  return args.length === 2;
}

export { State, trackedFunction };
//# sourceMappingURL=function.js.map
