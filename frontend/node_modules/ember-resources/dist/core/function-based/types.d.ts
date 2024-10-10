import Owner from '@ember/owner';
declare const INTERMEDIATE_VALUE = "__Intermediate_Value__";
declare const INTERNAL = "__INTERNAL__";
interface InternalFunctionResourceConfig<Value = unknown> {
    definition: ResourceFunction<Value>;
    type: 'function-based';
    [INTERNAL]: true;
}
type Hooks = {
    on: {
        /**
         * Optionally a function-resource can provide a cleanup function.
         *
         *
         *  Example:
         *  ```js
         *  import { resource } from 'ember-resources';
         *  import { TrackedObject } from 'tracked-built-ins';
         *
         *  const load = resource(({ on }) => {
         *    let state = new TrackedObject({});
         *    let controller = new AbortController();
         *
         *    on.cleanup(() => controller.abort());
         *
         *    fetch(this.url, { signal: controller.signal })
         *      // ...
         *
         *    return state;
         *  })
         */
        cleanup: (destroyer: Destructor) => void;
    };
    owner: Owner;
};
/**
 * Type of the callback passed to `resource`
 */
type ResourceFunction<Value = unknown> = (hooks: Hooks) => Value | (() => Value);
/**
 * The perceived return value of `resource`
 * This is a lie to TypeScript, because the effective value of
 * of the resource is the result of the collapsed functions
 * passed to `resource`
 */
type ResourceFn<Value = unknown> = (hooks: Hooks) => Value;
type Destructor = () => void;
type Cache = object;
export { INTERMEDIATE_VALUE, INTERNAL, InternalFunctionResourceConfig, Hooks, ResourceFunction, ResourceFn, Destructor, Cache };
