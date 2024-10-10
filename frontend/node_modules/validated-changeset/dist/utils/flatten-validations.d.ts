/**
 * With nested validations, we flatten to a dot separated 'user.email': validationFunc
 * Once doing so, validation will happen with a single level key or dot separated key
 *
 * @method flattenValidations
 * @return {object}
 */
export declare function flattenValidations(validatorMap: Record<string, any>): object;
//# sourceMappingURL=flatten-validations.d.ts.map