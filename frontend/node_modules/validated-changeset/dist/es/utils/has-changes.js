import isObject from './is-object';
import { isChange } from '../-private/change';
export function hasChanges(changes) {
    for (let key in changes) {
        if (isChange(changes[key])) {
            return true;
        }
        if (isObject(changes[key])) {
            const isTruthy = hasChanges(changes[key]);
            if (isTruthy) {
                return isTruthy;
            }
        }
    }
    return false;
}
//# sourceMappingURL=has-changes.js.map