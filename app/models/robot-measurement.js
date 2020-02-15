import DS from 'ember-data';
const {
  Model,
  attr,
  belongsTo,
} = DS;
import {
  computed,
  get,
} from '@ember/object';

export default class RobotMeasurementModel extends Model {
  @belongsTo('robot') robot;
  @attr('boolean') result;
  @attr('date') datetime;
  @attr('string') type;

  @computed('result')
  get humanReadableResult() {
    if (get(this, 'result')) {
      return "Pass";
    } else {
      return "Fail";
    }
  }
};
