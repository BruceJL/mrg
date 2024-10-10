import handleMultipleValidations from './handle-multiple-validations';
import isPromise from './is-promise';
import isObject from './is-object';
import get from './get-deep';
/**
 * returns a closure to lookup and validate k/v pairs set on a changeset
 *
 * @method lookupValidator
 * @param validationMap
 */
export default function lookupValidator(validationMap) {
    return ({ key, newValue, oldValue, changes, content }) => {
        const validations = validationMap || {};
        let validator = get(validations, key);
        const isValidatorClass = (maybeClass) => !!maybeClass.validate;
        if (validator && isValidatorClass(validator)) {
            validator = validator.validate.bind(validator);
        }
        if (!validator || isObject(validator)) {
            return true;
        }
        let validation;
        if (Array.isArray(validator)) {
            validation = handleMultipleValidations(validator, {
                key,
                newValue,
                oldValue,
                changes,
                content
            });
        }
        else {
            validation = validator(key, newValue, oldValue, changes, content);
        }
        return isPromise(validation)
            ? validation.then((result) => {
                return result;
            })
            : validation;
    };
}
//# sourceMappingURL=validator-lookup.js.map