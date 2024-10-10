var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
class TrackedStorageImpl {
    constructor(initialValue, isEqual) {
        this._value = this._lastValue = initialValue;
        this._isEqual = isEqual;
    }
}
__decorate([
    tracked
], TrackedStorageImpl.prototype, "_value", void 0);
function tripleEq(a, b) {
    return a === b;
}
export function createStorage(initialValue, isEqual = tripleEq) {
    assert('the second parameter to `createStorage` must be an equality function or undefined', typeof isEqual === 'function');
    return new TrackedStorageImpl(initialValue, isEqual);
}
export function getValue(storage) {
    assert('getValue must be passed a tracked store created with `createStorage`.', storage instanceof TrackedStorageImpl);
    return storage._value;
}
export function setValue(storage, value) {
    assert('setValue must be passed a tracked store created with `createStorage`.', storage instanceof TrackedStorageImpl);
    const { _isEqual: isEqual, _lastValue: lastValue } = storage;
    if (!isEqual(value, lastValue)) {
        storage._value = storage._lastValue = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFRdEMsTUFBTSxrQkFBa0I7SUFPdEIsWUFBWSxZQUFlLEVBQUUsT0FBZ0M7UUFDM0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUMxQixDQUFDO0NBQ0Y7QUFSVTtJQUFSLE9BQU87a0RBQVc7QUFVckIsU0FBUyxRQUFRLENBQUMsQ0FBVSxFQUFFLENBQVU7SUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUMzQixZQUFlLEVBQ2YsVUFBbUMsUUFBUTtJQUUzQyxNQUFNLENBQ0osbUZBQW1GLEVBQ25GLE9BQU8sT0FBTyxLQUFLLFVBQVUsQ0FDOUIsQ0FBQztJQUVGLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUVELE1BQU0sVUFBVSxRQUFRLENBQUksT0FBMEI7SUFDcEQsTUFBTSxDQUNKLHVFQUF1RSxFQUN2RSxPQUFPLFlBQVksa0JBQWtCLENBQ3RDLENBQUM7SUFFRixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDeEIsQ0FBQztBQUtELE1BQU0sVUFBVSxRQUFRLENBQ3RCLE9BQVUsRUFDVixLQUE2QjtJQUU3QixNQUFNLENBQ0osdUVBQXVFLEVBQ3ZFLE9BQU8sWUFBWSxrQkFBa0IsQ0FDdEMsQ0FBQztJQUVGLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7UUFDOUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztLQUM3QztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0cmFja2VkIH0gZnJvbSAnQGdsaW1tZXIvdHJhY2tpbmcnO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSAnQGVtYmVyL2RlYnVnJztcblxuZGVjbGFyZSBjb25zdCBTVE9SQUdFOiB1bmlxdWUgc3ltYm9sO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYWNrZWRTdG9yYWdlPFQ+IHtcbiAgW1NUT1JBR0VdOiBUO1xufVxuXG5jbGFzcyBUcmFja2VkU3RvcmFnZUltcGw8VD4gaW1wbGVtZW50cyBUcmFja2VkU3RvcmFnZTxUPiB7XG4gIGRlY2xhcmUgW1NUT1JBR0VdOiBUO1xuXG4gIEB0cmFja2VkIF92YWx1ZTogVDtcbiAgX2xhc3RWYWx1ZTogVDtcbiAgX2lzRXF1YWw6IChhOiBULCBiOiBUKSA9PiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxWYWx1ZTogVCwgaXNFcXVhbDogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4pIHtcbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX2xhc3RWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgICB0aGlzLl9pc0VxdWFsID0gaXNFcXVhbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmlwbGVFcShhOiB1bmtub3duLCBiOiB1bmtub3duKSB7XG4gIHJldHVybiBhID09PSBiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RvcmFnZTxUID0gdW5rbm93bj4oXG4gIGluaXRpYWxWYWx1ZTogVCxcbiAgaXNFcXVhbDogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4gPSB0cmlwbGVFcVxuKTogVHJhY2tlZFN0b3JhZ2U8VD4ge1xuICBhc3NlcnQoXG4gICAgJ3RoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBjcmVhdGVTdG9yYWdlYCBtdXN0IGJlIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIG9yIHVuZGVmaW5lZCcsXG4gICAgdHlwZW9mIGlzRXF1YWwgPT09ICdmdW5jdGlvbidcbiAgKTtcblxuICByZXR1cm4gbmV3IFRyYWNrZWRTdG9yYWdlSW1wbChpbml0aWFsVmFsdWUsIGlzRXF1YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWU8VD4oc3RvcmFnZTogVHJhY2tlZFN0b3JhZ2U8VD4pOiBUIHtcbiAgYXNzZXJ0KFxuICAgICdnZXRWYWx1ZSBtdXN0IGJlIHBhc3NlZCBhIHRyYWNrZWQgc3RvcmUgY3JlYXRlZCB3aXRoIGBjcmVhdGVTdG9yYWdlYC4nLFxuICAgIHN0b3JhZ2UgaW5zdGFuY2VvZiBUcmFja2VkU3RvcmFnZUltcGxcbiAgKTtcblxuICByZXR1cm4gc3RvcmFnZS5fdmFsdWU7XG59XG5cbnR5cGUgVHJhY2tlZFN0b3JhZ2VWYWx1ZTxUIGV4dGVuZHMgVHJhY2tlZFN0b3JhZ2U8dW5rbm93bj4+ID1cbiAgVCBleHRlbmRzIFRyYWNrZWRTdG9yYWdlPGluZmVyIFU+ID8gVSA6IG5ldmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0VmFsdWU8VCBleHRlbmRzIFRyYWNrZWRTdG9yYWdlPHVua25vd24+PihcbiAgc3RvcmFnZTogVCxcbiAgdmFsdWU6IFRyYWNrZWRTdG9yYWdlVmFsdWU8VD5cbik6IHZvaWQge1xuICBhc3NlcnQoXG4gICAgJ3NldFZhbHVlIG11c3QgYmUgcGFzc2VkIGEgdHJhY2tlZCBzdG9yZSBjcmVhdGVkIHdpdGggYGNyZWF0ZVN0b3JhZ2VgLicsXG4gICAgc3RvcmFnZSBpbnN0YW5jZW9mIFRyYWNrZWRTdG9yYWdlSW1wbFxuICApO1xuXG4gIGNvbnN0IHsgX2lzRXF1YWw6IGlzRXF1YWwsIF9sYXN0VmFsdWU6IGxhc3RWYWx1ZSB9ID0gc3RvcmFnZTtcblxuICBpZiAoIWlzRXF1YWwodmFsdWUsIGxhc3RWYWx1ZSkpIHtcbiAgICBzdG9yYWdlLl92YWx1ZSA9IHN0b3JhZ2UuX2xhc3RWYWx1ZSA9IHZhbHVlO1xuICB9XG59XG4iXX0=