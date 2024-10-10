export default class Notifier<T extends any[]> {
    listeners: ((...args: T) => void)[];
    constructor();
    addListener(callback: (...args: T) => void): () => void;
    removeListener(callback: (...args: T) => void): void;
    trigger(...args: T): void;
}
//# sourceMappingURL=notifier.d.ts.map