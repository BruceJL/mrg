// this statefull class holds and notifies
export default class Notifier {
    constructor() {
        this.listeners = [];
    }
    addListener(callback) {
        this.listeners.push(callback);
        return () => this.removeListener(callback);
    }
    removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === callback) {
                this.listeners.splice(i, 1);
                return;
            }
        }
    }
    trigger(...args) {
        this.listeners.forEach((callback) => callback(...args));
    }
}
//# sourceMappingURL=notifier.js.map