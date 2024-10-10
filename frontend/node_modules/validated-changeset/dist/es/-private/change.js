/* import { IChange } from '../types'; */
import isObject from '../utils/is-object';
export const VALUE = Symbol('__value__');
export default class Change {
    constructor(value) {
        this[VALUE] = value;
    }
}
// TODO: not sure why this function type guard isn't working
export const isChange = (maybeChange) => isObject(maybeChange) && VALUE in maybeChange;
export function getChangeValue(maybeChange) {
    if (isChange(maybeChange)) {
        return maybeChange[VALUE];
    }
}
//# sourceMappingURL=change.js.map