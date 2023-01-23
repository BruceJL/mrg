import Model, {
  belongsTo,
  attr,
  //type AsyncBelongsTo,
} from '@ember-data/model';

import {
  computed,
  get,
} from '@ember/object';

import type RobotModel from './robot';

export default class RobotMeasurementModel extends Model {
  @belongsTo('robot', {
    async: false,
    inverse: 'measurement',
  }) declare robot: RobotModel; //: AsyncBelongsTo<RobotModel>;

  @attr('boolean') declare result: boolean;
  @attr('date') declare datetime: Date;
  @attr('string') declare type: string;

  @computed('result')
  get humanReadableResult() {
    if (get(this, 'result')) {
      return "Pass";
    } else {
      return "Fail";
    }
  }
};
