import { _ as _defineProperty } from '../../../defineProperty-35ce617b.js';
import { expectTypeOf } from 'expect-type';
import { Resource } from '../resource.js';

/**
 * Base class
 */
expectTypeOf().parameters.toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();

// SomeClass is not a sub-class of Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();

// unknown is not a sub-class of Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();

/**
 * with no arguments specified
 */
class A extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "a", 1);
  }
}

// @ts-expect-error
A.from({});

/**
 * with all arguments specified
 */

class B extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "b", 'b');
  }
}
expectTypeOf().parameters.toEqualTypeOf();
expectTypeOf().toEqualTypeOf();

/**
 * with all arguments, but capitalized (Signature style)
 */

class C extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "c", 'c');
  }
}
expectTypeOf().parameters.toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
C.from(() => ({
  positional: [1, 'hi'],
  named: {
    num: 2,
    str: 'hi'
  }
}));
C.from({}, () => ({
  positional: [1, 'hi'],
  named: {
    num: 2,
    str: 'hi'
  }
}));

/**
 * With only positional args
 */
class Doubler extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "doubled", 2);
  }
}
Doubler.from(() => [1]);
Doubler.from({}, () => [2]);

export { B, C, Doubler };
//# sourceMappingURL=resource.test.js.map
