import { Hooks } from "../core/function-based/index";
type ResourceFn<Return = unknown> = (hooks: Hooks) => Return | Promise<Return>;
type Vanilla<Return> = [object, ResourceFn<Return>];
type WithInitialValue<Return> = [object, NotFunction<Return>, ResourceFn<Return>];
type NotFunction<T> = T extends Function ? never : T;
/**
 * _An example utilty that uses [[resource]]_
 *
 * Any tracked data accessed in a tracked function _before_ an `await`
 * will "entangle" with the function -- we can call these accessed tracked
 * properties, the "tracked prelude". If any properties within the tracked
 * payload  change, the function will re-run.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 * import { trackedFunction }  from 'ember-resources/util/function';
 *
 * class Demo extends Component {
 *   @tracked id = 1;
 *
 *   request = trackedFunction(this, async () => {
 *     let response = await fetch(`https://swapi.dev/api/people/${this.id}`);
 *     let data = await response.json();
 *
 *     return data; // { name: 'Luke Skywalker', ... }
 *   });
 *
 *   updateId = (event) => this.id = event.target.value;
 *
 *   // Renders "Luke Skywalker"
 *   <template>
 *     {{this.request.value.name}}
 *
 *     <input value={{this.id}} {{on 'input' this.updateId}}>
 *   </template>
 * }
 * ```
 * _Note_, this example uses the proposed `<template>` syntax from the [First-Class Component Templates RFC][rfc-799]
 *
 * Also note that after an `await`, the `this` context should not be accessed as it could lead to
 * destruction/timing issues.
 *
 * [rfc-799]: https://github.com/emberjs/rfcs/pull/779
 *
 *
 * @param {Object} destroyable context, e.g.: component instance aka "this"
 * @param {Function} theFunction the function to run with the return value available on .value
 */
declare function trackedFunction<Return>(...passed: Vanilla<Return>): State<Return>;
/**
 * _An example utilty that uses [[resource]]_
 *
 * Any tracked data accessed in a tracked function _before_ an `await`
 * will "entangle" with the function -- we can call these accessed tracked
 * properties, the "tracked prelude". If any properties within the tracked
 * payload  change, the function will re-run.
 *
 * The optional initial values can be used to provide a nicer fallback than "null"
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 * import { trackedFunction }  from 'ember-resources/util/function';
 *
 * class Demo extends Component {
 *   @tracked id = 1;
 *
 *   request = trackedFunction(this, { initial value here }, async () => {
 *     let response = await fetch(`https://swapi.dev/api/people/${this.id}`);
 *     let data = await response.json();
 *
 *     return data; // { name: 'Luke Skywalker', ... }
 *   });
 *
 *   updateId = (event) => this.id = event.target.value;
 *
 *   // Renders "Luke Skywalker"
 *   <template>
 *     {{this.request.value.name}}
 *
 *     <input value={{this.id}} {{on 'input' this.updateId}}>
 *   </template>
 * }
 * ```
 * _Note_, this example uses the proposed `<template>` syntax from the [First-Class Component Templates RFC][rfc-799]
 *
 * Also note that after an `await`, the `this` context should not be accessed as it could lead to
 * destruction/timing issues.
 *
 * [rfc-799]: https://github.com/emberjs/rfcs/pull/779
 *
 * @param {Object} destroyable context, e.g.: component instance aka "this"
 * @param {Object} initialValue - a non-function that matches the shape of the eventual return value of theFunction
 * @param {Function} theFunction the function to run with the return value available on .value
 */
declare function trackedFunction<Return>(...passed: WithInitialValue<Return>): State<Return>;
/**
 * State container that represents the asynchrony of a `trackedFunction`
 */
declare class State<Value> {
    #private;
    isResolved: boolean;
    resolvedValue?: Value;
    error?: unknown;
    constructor(fn: ResourceFn<Value>, hooks: Hooks, initialValue?: Value);
    get value(): NonNullable<Value> | null;
    get isPending(): boolean;
    get isLoading(): boolean;
    get isError(): boolean;
    /**
     * Will re-invoke the function passed to `trackedFunction`
     * this will also re-set some properties on the `State` instance.
     * This is the same `State` instance as before, as the `State` instance
     * is tied to the `fn` passed to `trackedFunction`
     *
     * `error` or `resolvedValue` will remain as they were previously
     * until this promise resolves, and then they'll be updated to the new values.
     */
    retry: () => Promise<void>;
}
export { ResourceFn, trackedFunction, State };
