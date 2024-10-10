export declare const VALUE: unique symbol;
export default class Change {
    [VALUE]: unknown;
    constructor(value: unknown);
}
export declare const isChange: (maybeChange: unknown) => maybeChange is Change;
export declare function getChangeValue(maybeChange: Change | unknown): any;
//# sourceMappingURL=change.d.ts.map