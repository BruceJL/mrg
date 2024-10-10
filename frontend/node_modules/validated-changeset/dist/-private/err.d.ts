import type { IErr, ValidationErr } from '../types';
export default class Err implements IErr<any> {
    value: any;
    validation: ValidationErr | ValidationErr[];
    constructor(value: any, validation: ValidationErr | ValidationErr[]);
}
//# sourceMappingURL=err.d.ts.map