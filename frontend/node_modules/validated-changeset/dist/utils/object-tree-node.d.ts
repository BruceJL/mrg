import type { ProxyHandler, Content } from '../types';
declare class ObjectTreeNode implements ProxyHandler {
    safeGet: (obj: any, key: string) => any;
    isObject: (...args: unknown[]) => unknown;
    changes: Record<string, any>;
    content: Content;
    proxy: any;
    children: Record<string, any>;
    constructor(changes?: Record<string, any>, content?: Content, safeGet?: (obj: any, key: string) => any, isObject?: (...args: unknown[]) => unknown);
    get(key: string): any;
    set(key: string, value: unknown): any;
    unwrap(): Record<string, any>;
}
export { ObjectTreeNode };
//# sourceMappingURL=object-tree-node.d.ts.map