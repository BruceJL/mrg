import Model, {
  hasMany,
  belongsTo,
  attr,
  type AsyncBelongsTo,
} from '@ember-data/model';

import {
  computed,
  get,
} from '@ember/object';

import type RobotModel from './robot';

export default class RobotMeasurementModel extends Model {
  @belongsTo('robot',  {
    inverse: 'robot',
    async: true,
  }) declare robot: AsyncBelongsTo<RobotModel>;

  @attr('boolean') declare result: boolean;
  @attr('date') declare datetime: string;
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
