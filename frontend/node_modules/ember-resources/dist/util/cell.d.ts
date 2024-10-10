declare class Cell<Value = unknown> {
    current: Value;
    constructor();
    constructor(initialValue: Value);
    /**
     * Toggles the value of `current` only if
     * `current` is a boolean -- errors otherwise
     */
    toggle: () => void;
    /**
     * Updates the value of `current`
     * by calling a function that recieves the previous value.
     */
    update: (updater: (prevValue: Value) => Value) => void;
    /**
     * Updates the value of `current`
     */
    set: (nextValue: Value) => void;
}
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
declare function cell<Value = unknown>(initialValue?: Value): Cell<Value>;
export { cell };
