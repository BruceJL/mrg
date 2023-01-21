import Model, {
  attr,
  belongsTo,
} from '@ember-data/model';

import type RobotModel from './robot';

export default class ActivityLogModel extends Model {
  @attr('date') declare datetime: string;
  @attr('string') declare volunteer: string;
  @attr('string') declare function: string;
  @attr('string') declare action: string;

  @belongsTo('robot', {
    async: false,
    inverse: null
  }) declare entry: RobotModel ;
}
