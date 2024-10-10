import { helper } from '@ember/component/helper';
//
// export function val([fn] : [(arg: unknown) => void]/*, hash*/) {
//   return (arg: { target: { value: unknown } }) => fn(arg.target.value)
// }
//

export function val([fn] /*, hash*/) {
    return (arg) => fn(arg.target.value);
}

 export default helper(val);
