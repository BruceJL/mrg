import type Route from '@ember/routing/route';

/** Get the resolved model value from a route. */
export type ModelFrom<R extends Route> = Awaited<ReturnType<R['model']>>;

// Above taken from https://guides.emberjs.com/release/typescript/core-concepts/routing/
