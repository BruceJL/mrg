let getOwnPropertyDescriptors;
if (Object.getOwnPropertyDescriptors !== undefined) {
    getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
}
else {
    getOwnPropertyDescriptors = function (obj) {
        let desc = {};
        Object.keys(obj).forEach((key) => {
            desc[key] = Object.getOwnPropertyDescriptor(obj, key);
        });
        return desc;
    };
}
// keep getters and setters
export default function pureAssign(...objects) {
    return objects.reduce((acc, obj) => {
        return Object.defineProperties(acc, getOwnPropertyDescriptors(obj));
    }, {});
}
//# sourceMappingURL=assign.js.map