//export default function validateRobot(/* options = {} */) {
// return (/* key, newValue, oldValue, changes, content */) => {
//   return true;
//  };
//}

import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default class RobotValidation extends Object{
  robot = [
    validateLength({
      min: 1,
      max: 28
    }),
    validatePresence(true)
  ];

  school =  validateLength({
    max: 150
  });

  driver1 = validatePresence(true);

  coach = validatePresence(true);

  ph = validateFormat({
    type: 'phone'
  });

  email = validateFormat({
    type: 'email'
  });
}
