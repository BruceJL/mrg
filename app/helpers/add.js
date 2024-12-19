import { helper } from '@ember/component/helper';

export function add([a, b]) {
  return a + b; // Add the two arguments (a and b)
}

export default helper(add);
