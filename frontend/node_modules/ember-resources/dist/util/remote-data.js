import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from '../applyDecoratedDescriptor-d3d95cf1.js';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import { resourceFactory } from '../core/function-based/immediate-invocation.js';
import { resource } from '../core/function-based/resource.js';

var _class, _descriptor, _descriptor2, _descriptor3;
/**
 * @protected
 */
let State = (_class = class State {
  constructor() {
    _initializerDefineProperty(this, "error", _descriptor, this);
    _initializerDefineProperty(this, "value", _descriptor2, this);
    _initializerDefineProperty(this, "status", _descriptor3, this);
  }
  /**
   * true if the request has finished
   */
  get isResolved() {
    return Boolean(this.value) || Boolean(this.error);
  }

  /**
   * Alias for isLoading
   */
  get isPending() {
    return this.isLoading;
  }

  /**
   * true if the fetch request is in progress
   */
  get isLoading() {
    return !this.isResolved;
  }

  /**
   * true if the request throws an exception
   */
  get isError() {
    return Boolean(this.error);
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "error", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return null;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "value", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return null;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "status", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return null;
  }
})), _class);

/**
 * Native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * but with built-in [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
 *
 * example with composition (maybe you want to implement your own version
 * that also wraps up authorization headers):
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { use, resource } from 'ember-resources';
 * import { remoteData } from 'ember-resources/util/remote-data';
 *
 * class Demo {
 *   @tracked id = 1;
 *
 *   @use myData = resource((hooks) =>
 *     remoteData(hooks, `https://...${this.id}`)
 *   );
 * }
 * ```
 *
 * The same example, but without `@use`
 *
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { resource } from 'ember-resources';
 * import { remoteData } from 'ember-resources/util/remote-data';
 *
 * class Demo {
 *   @tracked id = 1;
 *
 *   myData = resource(this, (hooks) =>
 *     remoteData(hooks, `https://...${this.id}`)
 *   );
 * }
 * ```
 *
 */
function remoteData({
  on
}, url, options = {}) {
  let state = new State();
  let controller = new AbortController();
  on.cleanup(() => controller.abort());
  waitForPromise(fetch(url, {
    signal: controller.signal,
    ...options
  }).then(response => {
    state.status = response.status;
    return response.json();
  }).then(data => {
    state.value = data;
  }).catch(error => {
    state.error = error;
  }));
  return state;
}

/**
 * json-based remote data utility.
 *
 * this API mimics the API of `fetch`, and will give you a reactive
 * [[State]] object, but won't be able to re-fetch when the url or options
 * change
 *
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { use } from 'ember-resources';
 * import { RemoteData } from 'ember-resources/util/remote-data';
 *
 * class Demo {
 *   @use myData = RemoteData(`https://some.domain.io`);
 *
 *   @use withOptions = RemoteData(`https://some.domain.io`, {
 *     headers: {
 *       Authorization: 'Bearer <token>'
 *     }
 *   });
 * }
 * ```
 *
 * In strict mode with &lt;template&gt;
 * ```jsx gjs
 * import { RemoteData } from 'ember-resources/util/remote-data';
 *
 * const options = (token) => ({
 *   headers: {
 *     Authorization: `Bearer ${token}`
 *   }
 * });
 *
 * <template>
 *  {{#let (RemoteData "https://some.domain" (options "my-token")) as |state|}}
 *    {{state.isLoading}}
 *    {{state.value}}
 *  {{/let}}
 * </template>
 * ```
 *
 */

/**
 * json-based remote data utility
 */
function RemoteData(url, opts) {
  return resource(hooks => {
    let result = typeof url === 'string' ? url : url();
    let targetUrl;
    let options = {};
    if (typeof result === 'string') {
      targetUrl = result;
    } else {
      let {
        url,
        ...opts
      } = result;
      targetUrl = url;
      options = opts;
    }
    if (opts) {
      options = {
        ...options,
        ...opts
      };
    }
    return remoteData(hooks, targetUrl, options);
  });
}
resourceFactory(RemoteData);

export { RemoteData, State, remoteData };
//# sourceMappingURL=remote-data.js.map
