import Model, { belongsTo, attr } from '@ember-data/model';
import type RobotModel from './robot';

export default class RobotMeasurementModel extends Model {
  @belongsTo('robot', {
    async: false,
    inverse: 'measurement',
  })
  declare robot: RobotModel;

  @attr('boolean') declare result: boolean;
  @attr('date') declare datetime: Date;
  @attr('string') declare type: string;

  get humanReadableResult() {
    if (this.result) {
      return 'Pass';
    } else {
      return 'Fail';
    }
  }
}
