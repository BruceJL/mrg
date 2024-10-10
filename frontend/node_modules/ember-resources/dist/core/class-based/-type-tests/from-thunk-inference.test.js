import { _ as _defineProperty } from '../../../defineProperty-35ce617b.js';
import { expectTypeOf } from 'expect-type';
import { Resource } from '../resource.js';

/**
 * with no arguments specified
 */
class A extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "a", 1);
  }
}

// TODO: rename to create when there are no args?
// are there use cases for class-based Resources without args?
// no args seems like it'd be easier as a function-resource.
// Valid, no args present
// A.from();
A.from(() => ({}));
A.from(() => []);

// Invalid, A does not expect args
// @ts-expect-error
A.from(() => ({
  positional: [1]
}));
//
// Invalid, A does not expect args
// @ts-expect-error
A.from(() => ({
  named: {
    foo: 2
  }
}));

// valid, empty args are ok
A.from(() => ({
  positional: [],
  named: {}
}));
class UsageA {
  constructor() {
    _defineProperty(this, "a", A.from(this, () => ({})));
    _defineProperty(this, "a1", A.from(this, () => []));
    _defineProperty(this, "a2", A.from(this, () => ({
      positional: [1]
    })));
    _defineProperty(this, "a3", A.from(this, () => ({
      named: {
        foo: 2
      }
    })));
    _defineProperty(this, "a4", A.from(this, () => ({
      positional: [],
      named: {}
    })));
  }
}

/**
 * with all arguments specified
 */

class B extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "b", 'b');
  }
}

// Valid, all arguments provided
B.from(() => {
  return {
    positional: [1, 'hi'],
    named: {
      num: 2,
      str: 'there'
    }
  };
});
class UsageB {
  constructor() {
    _defineProperty(this, "b", B.from(this, () => ({})));
    _defineProperty(this, "b1", B.from(this, () => ({
      positional: [1, 'hi']
    })));
    _defineProperty(this, "b2", B.from(this, () => ({
      named: {
        num: 2,
        str: 'there'
      }
    })));
    _defineProperty(this, "b3", B.from(this, () => ({
      positional: ['hi']
    })));
    _defineProperty(this, "b4", B.from(this, () => ({
      named: {
        str: 'there'
      }
    })));
    _defineProperty(this, "b5", B.from(this, () => ({
      positional: [1, 'hi'],
      named: {
        num: 2,
        str: 'there'
      }
    })));
  }
}

/**
 * with all arguments, but capitalized (Signature style)
 */

class C extends Resource {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "c", 'c');
  }
}

/**
 * The return value of the thunk has the correct type
 */
class UsageC {
  constructor() {
    _defineProperty(this, "cUse", C.from(() => ({
      positional: [1, 'two'],
      named: {
        num: 3,
        str: 'four'
      }
    })));
    _defineProperty(this, "cThis", C.from(this, () => ({
      positional: [1, 'two'],
      named: {
        num: 3,
        str: 'four'
      }
    })));
  }
}
expectTypeOf(new UsageC().cUse).toEqualTypeOf();
expectTypeOf(new UsageC().cThis).toEqualTypeOf();

export { B, C, UsageA, UsageB, UsageC };
//# sourceMappingURL=from-thunk-inference.test.js.map
