import { Resource } from "../resource";
/**
 * with all arguments specified
 */
type BArgs = {
    positional: [number, string];
    named: {
        num: number;
        str: string;
    };
};
declare class B<Args = BArgs> extends Resource<Args> {
    b: string;
}
/**
 * with all arguments, but capitalized (Signature style)
 */
type CArgs = {
    Positional: [number, string];
    Named: {
        /**
         * How do I test / assert JSDoc is carried?
         * (it is, but I can't prove it)
         * docs?
         */
        num: number;
        str: string;
    };
};
declare class C extends Resource<CArgs> {
    c: string;
}
/**
 * With only positional args
 */
declare class Doubler extends Resource<{
    positional: [number];
}> {
    doubled: number;
}
export { B, C, Doubler };
