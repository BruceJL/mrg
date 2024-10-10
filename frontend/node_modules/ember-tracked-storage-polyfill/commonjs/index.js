"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setValue = exports.getValue = exports.createStorage = void 0;
const tracking_1 = require("@glimmer/tracking");
const debug_1 = require("@ember/debug");
class TrackedStorageImpl {
    constructor(initialValue, isEqual) {
        this._value = this._lastValue = initialValue;
        this._isEqual = isEqual;
    }
}
__decorate([
    tracking_1.tracked
], TrackedStorageImpl.prototype, "_value", void 0);
function tripleEq(a, b) {
    return a === b;
}
function createStorage(initialValue, isEqual = tripleEq) {
    debug_1.assert('the second parameter to `createStorage` must be an equality function or undefined', typeof isEqual === 'function');
    return new TrackedStorageImpl(initialValue, isEqual);
}
exports.createStorage = createStorage;
function getValue(storage) {
    debug_1.assert('getValue must be passed a tracked store created with `createStorage`.', storage instanceof TrackedStorageImpl);
    return storage._value;
}
exports.getValue = getValue;
function setValue(storage, value) {
    debug_1.assert('setValue must be passed a tracked store created with `createStorage`.', storage instanceof TrackedStorageImpl);
    const { _isEqual: isEqual, _lastValue: lastValue } = storage;
    if (!isEqual(value, lastValue)) {
        storage._value = storage._lastValue = value;
    }
}
exports.setValue = setValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsZ0RBQTRDO0FBQzVDLHdDQUFzQztBQVF0QyxNQUFNLGtCQUFrQjtJQU90QixZQUFZLFlBQWUsRUFBRSxPQUFnQztRQUMzRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzFCLENBQUM7Q0FDRjtBQVJVO0lBQVIsa0JBQU87a0RBQVc7QUFVckIsU0FBUyxRQUFRLENBQUMsQ0FBVSxFQUFFLENBQVU7SUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFnQixhQUFhLENBQzNCLFlBQWUsRUFDZixVQUFtQyxRQUFRO0lBRTNDLGNBQU0sQ0FDSixtRkFBbUYsRUFDbkYsT0FBTyxPQUFPLEtBQUssVUFBVSxDQUM5QixDQUFDO0lBRUYsT0FBTyxJQUFJLGtCQUFrQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBVkQsc0NBVUM7QUFFRCxTQUFnQixRQUFRLENBQUksT0FBMEI7SUFDcEQsY0FBTSxDQUNKLHVFQUF1RSxFQUN2RSxPQUFPLFlBQVksa0JBQWtCLENBQ3RDLENBQUM7SUFFRixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDeEIsQ0FBQztBQVBELDRCQU9DO0FBS0QsU0FBZ0IsUUFBUSxDQUN0QixPQUFVLEVBQ1YsS0FBNkI7SUFFN0IsY0FBTSxDQUNKLHVFQUF1RSxFQUN2RSxPQUFPLFlBQVksa0JBQWtCLENBQ3RDLENBQUM7SUFFRixNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRTdELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1FBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7S0FDN0M7QUFDSCxDQUFDO0FBZEQsNEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0cmFja2VkIH0gZnJvbSAnQGdsaW1tZXIvdHJhY2tpbmcnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGVtYmVyL2RlYnVnJztcblxuZGVjbGFyZSBjb25zdCBTVE9SQUdFOiB1bmlxdWUgc3ltYm9sO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYWNrZWRTdG9yYWdlPFQ+IHtcbiAgW1NUT1JBR0VdOiBUO1xufVxuXG5jbGFzcyBUcmFja2VkU3RvcmFnZUltcGw8VD4gaW1wbGVtZW50cyBUcmFja2VkU3RvcmFnZTxUPiB7XG4gIGRlY2xhcmUgW1NUT1JBR0VdOiBUO1xuXG4gIEB0cmFja2VkIF92YWx1ZTogVDtcbiAgX2xhc3RWYWx1ZTogVDtcbiAgX2lzRXF1YWw6IChhOiBULCBiOiBUKSA9PiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxWYWx1ZTogVCwgaXNFcXVhbDogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4pIHtcbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2xhc3RWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgICB0aGlzLl9pc0VxdWFsID0gaXNFcXVhbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmlwbGVFcShhOiB1bmtub3duLCBiOiB1bmtub3duKSB7XG4gIHJldHVybiBhID09PSBiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmFnZTxUID0gdW5rbm93bj4oXG4gIGluaXRpYWxWYWx1ZTogVCxcbiAgaXNFcXVhbDogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4gPSB0cmlwbGVFcVxuKTogVHJhY2tlZFN0b3JhZ2U8VD4ge1xuICBhc3NlcnQoXG4gICAgJ3RoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBjcmVhdGVTdG9yYWdlYCBtdXN0IGJlIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIG9yIHVuZGVmaW5lZCcsXG4gICAgdHlwZW9mIGlzRXF1YWwgPT09ICdmdW5jdGlvbidcbiAgKTtcblxuICByZXR1cm4gbmV3IFRyYWNrZWRTdG9yYWdlSW1wbChpbml0aWFsVmFsdWUsIGlzRXF1YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWU8VD4oc3RvcmFnZTogVHJhY2tlZFN0b3JhZ2U8VD4pOiBUIHtcbiAgYXNzZXJ0KFxuICAgICdnZXRWYWx1ZSBtdXN0IGJlIHBhc3NlZCBhIHRyYWNrZWQgc3RvcmUgY3JlYXRlZCB3aXRoIGBjcmVhdGVTdG9yYWdlYC4nLFxuICAgIHN0b3JhZ2UgaW5zdGFuY2VvZiBUcmFja2VkU3RvcmFnZUltcGxcbiAgKTtcblxuICByZXR1cm4gc3RvcmFnZS5fdmFsdWU7XG59XG5cbnR5cGUgVHJhY2tlZFN0b3JhZ2VWYWx1ZTxUIGV4dGVuZHMgVHJhY2tlZFN0b3JhZ2U8dW5rbm93bj4+ID1cbiAgVCBleHRlbmRzIFRyYWNrZWRTdG9yYWdlPGluZmVyIFU+ID8gVSA6IG5ldmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0VmFsdWU8VCBleHRlbmRzIFRyYWNrZWRTdG9yYWdlPHVua25vd24+PihcbiAgc3RvcmFnZTogVCxcbiAgdmFsdWU6IFRyYWNrZWRTdG9yYWdlVmFsdWU8VD5cbik6IHZvaWQge1xuICBhc3NlcnQoXG4gICAgJ3NldFZhbHVlIG11c3QgYmUgcGFzc2VkIGEgdHJhY2tlZCBzdG9yZSBjcmVhdGVkIHdpdGggYGNyZWF0ZVN0b3JhZ2VgLicsXG4gICAgc3RvcmFnZSBpbnN0YW5jZW9mIFRyYWNrZWRTdG9yYWdlSW1wbFxuICApO1xuXG4gIGNvbnN0IHsgX2lzRXF1YWw6IGlzRXF1YWwsIF9sYXN0VmFsdWU6IGxhc3RWYWx1ZSB9ID0gc3RvcmFnZTtcblxuICBpZiAoIWlzRXF1YWwodmFsdWUsIGxhc3RWYWx1ZSkpIHtcbiAgICBzdG9yYWdlLl92YWx1ZSA9IHN0b3JhZ2UuX2xhc3RWYWx1ZSA9IHZhbHVlO1xuICB9XG59XG4iXX0=