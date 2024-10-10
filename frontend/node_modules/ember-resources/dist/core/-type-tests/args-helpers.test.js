import { expectTypeOf } from 'expect-type';
import '../class-based/manager.js';
import '@glimmer/tracking/primitives/cache';
import '@ember/application';
import '@ember/debug';
import '@ember/helper';

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

/**
 * -----------------------------------------------------------
 * Named
 * -----------------------------------------------------------
 */
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
// @ts-expect-error
expectTypeOf().toEqualTypeOf();

/**
 * -----------------------------------------------------------
 * Positional
 * -----------------------------------------------------------
 */
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
// {} does not extend Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
// unknown does not extend Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
// number does not extend Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
// string does not extend Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
// Foo does not extend Resource
// @ts-expect-error
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
expectTypeOf().toEqualTypeOf();
//# sourceMappingURL=args-helpers.test.js.map
