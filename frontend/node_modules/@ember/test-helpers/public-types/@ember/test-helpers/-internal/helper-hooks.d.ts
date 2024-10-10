declare type Hook = (...args: any[]) => void | Promise<void>;
declare type HookLabel = 'start' | 'end' | string;
declare type HookUnregister = {
    unregister: () => void;
};
/**
 * Registers a hook function to be run during the invocation of a test helper.
 *
 * @private
 * @param {string} helperName The name of the test helper in which to run the hook.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating the start of the helper invocation and the end.
 * @param {Function} hook The hook function to run when the test helper is invoked.
 * @returns {HookUnregister} An object containing an unregister function that will unregister
 *                           the specific hook registered to the helper.
 */
export declare function registerHook(helperName: string, label: HookLabel, hook: Hook): HookUnregister;
/**
 * Runs all hooks registered for a specific test helper.
 *
 * @private
 * @param {string} helperName  The name of the test helper.
 * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
 *                       designating the start of the helper invocation and the end.
 * @param {any[]} args Any arguments originally passed to the test helper.
 * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
 */
export declare function runHooks(helperName: string, label: HookLabel, ...args: any[]): Promise<void>;
export {};
//# sourceMappingURL=helper-hooks.d.ts.map