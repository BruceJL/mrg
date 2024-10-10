import type { ValidatorMapFunc, ValidatorClass } from '../types';
/**
 * Handles an array of validators and returns Promise.all if any value is a
 * Promise.
 *
 * @public
 * @param  {Array} validators Array of validator functions
 * @param  {String} options.key
 * @param  {Any} options.newValue
 * @param  {Any} options.oldValue
 * @param  {Object} options.changes
 * @param  {Object} options.content
 * @return {Promise|boolean|Any}
 */
export default function handleMultipleValidations(validators: Array<ValidatorMapFunc | ValidatorClass>, { key, newValue, oldValue, changes, content }: {
    [s: string]: any;
}): boolean | any;
//# sourceMappingURL=handle-multiple-validations.d.ts.map