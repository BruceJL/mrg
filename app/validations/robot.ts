import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default class RobotValidation{
  name: any;
  school: any;
  driver1: any;
  coach: any;
  ph: any;
  email: any;

  constructor(){
    this.name = [
      validateLength({
        min: 1,
        max: 28,
      }),
      validatePresence(true)
    ];

    this.school = validateLength({
      max: 150
    });

    this.driver1 = validatePresence(true);

    this.coach = validatePresence(true);

    this.ph = validateFormat({
      type: 'phone'
    });

    this.email = validateFormat({
      type: 'email'
    });
  }
}
