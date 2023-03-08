import Model, {
  belongsTo,
  attr,
} from '@ember-data/model';

import type CompetitionModel from './competition';
import type RobotModel from './robot';

export default class RingAssignmentModel extends Model {
    @belongsTo('competition', {
      async: false,
      inverse: 'ringAssignment',
    }) declare competition: CompetitionModel;

    @belongsTo('robot', {
      async: false,
      inverse: 'ringAssignment',
    }) declare robot: RobotModel;

    @attr('number') declare ring?: number;
    @attr('string') declare letter?: string;
    //@attr('number') declare round?: number;
}
