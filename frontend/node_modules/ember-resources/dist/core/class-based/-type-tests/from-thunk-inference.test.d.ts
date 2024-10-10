import { Resource } from "../resource";
/**
 * with no arguments specified
 */
declare class A extends Resource {
    a: number;
}
declare class UsageA {
    a: A;
    a1: A;
    a2: A;
    a3: A;
    a4: A;
}
/**
 * with all arguments specified
 */
type BArgs = {
    positional: [num: number, greeting: string];
    named: {
        num: number;
        str: string;
    };
};
declare class B extends Resource<BArgs> {
    b: string;
}
declare class UsageB {
    b: B;
    b1: B;
    b2: B;
    b3: B;
    b4: B;
    b5: B;
}
/**
 * with all arguments, but capitalized (Signature style)
 */
type CArgs = {
    Positional: [number, string];
    Named: {
        num: number;
        str: string;
    };
};
declare class C extends Resource<CArgs> {
    c: string;
}
/**
 * The return value of the thunk has the correct type
 */
declare class UsageC {
    cUse: C;
    cThis: C;
}
export { UsageA, B, UsageB, C, UsageC };
