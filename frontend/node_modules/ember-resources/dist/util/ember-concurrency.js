import { _ as _defineProperty } from '../defineProperty-35ce617b.js';
import { getValue } from '@glimmer/tracking/primitives/cache';
import { assert } from '@ember/debug';
import { invokeHelper } from '@ember/helper';
import { get } from '@ember/object';
import '../core/class-based/manager.js';
import { Resource } from '../core/class-based/resource.js';
import { normalizeThunk, DEFAULT_THUNK } from '../core/utils.js';

/**
 * @utility uses [[Resource]] to make ember-concurrency tasks reactive.
 *
 * -------------------------
 *
 * @note `ember-resources` does not provide or depend on ember-concurrency.
 * If you want to use [[task]], you'll need to add ember-concurrency as a dependency
 * in your project.
 *
 * @example
 *  When `this.id` changes, the task will automatically be re-invoked.
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { restartableTask, timeout } from 'ember-concurrency';
 * import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
 *
 * class Demo {
 *   @tracked id = 1;
 *
 *   last = trackedTask(this, this.searchTask, () => [this.id]);
 *
 *   @restartableTask
 *   *searchTask(id) {
 *     yield timeout(200);
 *     yield fetch('...');
 *
 *     return 'the-value';
 *   }
 * }
 * ```
 * ```hbs
 * Available Properties:
 *  {{this.last.value}}
 *  {{this.last.isFinished}}
 *  {{this.last.isRunning}}
 *  {{this.last.value}}
 * ```
 *  (and all other properties on a [TaskInstance](https://ember-concurrency.com/api/TaskInstance.html))
 *
 *
 */
function task(context, task, thunk) {
  assert(`Task does not have a perform method. Is it actually a task?`, 'perform' in task);
  let target = buildUnproxiedTaskResource(context, task, thunk || DEFAULT_THUNK);

  // TS can't figure out what the proxy is doing
  return proxyClass(target);
}
const trackedTask = task;
const TASK_CACHE = new WeakMap();
function buildUnproxiedTaskResource(context, task, thunk) {
  let resource;
  let klass;
  let existing = TASK_CACHE.get(task);
  if (existing) {
    klass = existing;
  } else {
    klass = class AnonymousTaskRunner extends TaskResource {
      constructor(...args) {
        super(...args);
        _defineProperty(this, TASK, task);
      }
    };
    TASK_CACHE.set(task, klass);
  }
  return {
    get value() {
      if (!resource) {
        resource = invokeHelper(context, klass, () => {
          return normalizeThunk(thunk);
        });
      }
      return getValue(resource);
    }
  };
}
function proxyClass(target) {
  /*
   * This proxy defaults to returning the underlying data on
   * the task runner when '.value' is accessed.
   *
   * When working with ember-concurrency tasks, users have the expectation
   * that they'll be able to inspect the status of the tasks, such as
   * `isRunning`, `isFinished`, etc.
   *
   * To support that, we need to proxy to the `currentTask`.
   *
   */
  return new Proxy(target, {
    get(target, key) {
      const taskRunner = target.value;
      const instance = taskRunner.currentTask;
      if (typeof key === 'string') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        get(taskRunner.currentTask, key);
      }
      if (key === 'value') {
        /**
         * getter than falls back to the previous task's value
         */
        return taskRunner.value;
      }

      /**
       * If the key is anything other than value, query on the currentTask
       */
      const value = Reflect.get(instance, key, instance);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.value);
    },
    getOwnPropertyDescriptor(target, key) {
      return Reflect.getOwnPropertyDescriptor(target.value, key);
    }
  });
}
// @private
const TASK = Symbol('TASK');

// @private
class TaskResource extends Resource {
  // Set via useTask

  // Set during setup/update

  get value() {
    return this.currentTask.value ?? this.lastTask?.value;
  }
  modify(positional) {
    if (this.currentTask) {
      this.lastTask = this.currentTask;
    }
    this.currentTask = this[TASK].perform(...positional);
  }
  teardown() {
    this[TASK].cancelAll();
  }
}

export { TASK, TaskResource, proxyClass, task, trackedTask };
//# sourceMappingURL=ember-concurrency.js.map
