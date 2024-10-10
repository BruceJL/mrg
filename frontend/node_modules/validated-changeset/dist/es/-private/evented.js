import Notifier from './notifier';
export function notifierForEvent(object, eventName) {
    if (object._eventedNotifiers === undefined) {
        object._eventedNotifiers = {};
    }
    let notifier = object._eventedNotifiers[eventName];
    if (!notifier) {
        notifier = object._eventedNotifiers[eventName] = new Notifier();
    }
    return notifier;
}
//# sourceMappingURL=evented.js.map