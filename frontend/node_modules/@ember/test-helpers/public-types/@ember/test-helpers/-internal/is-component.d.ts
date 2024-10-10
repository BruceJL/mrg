/**
 * We should ultimately get a new API from @glimmer/runtime that provides this functionality
 * (see https://github.com/emberjs/rfcs/pull/785 for more info).
 * @private
 * @param {Object} maybeComponent The thing you think might be a component
 * @param {Object} owner Owner, we need this for old versions of getComponentManager
 * @returns {boolean} True if it's a component, false if not
 */
declare function isComponent(maybeComponent: object, owner: object): boolean;
export default isComponent;
//# sourceMappingURL=is-component.d.ts.map