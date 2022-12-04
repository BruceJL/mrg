import Model, {
  belongsTo,
  attr,
  type AsyncBelongsTo,
} from '@ember-data/model';

import type CompetitionModel from './competition';
import type RobotModel from './robot';

export default class RingAssignmentModel extends Model {
    @belongsTo('competition',  {
      inverse: null,
      async: true,
    }) declare competition: AsyncBelongsTo<CompetitionModel>;

    @belongsTo('robot',  {
      inverse: null,
      async: true,
    }) declare robot: AsyncBelongsTo<RobotModel>;

    @attr('number') declare ring?: number;
    @attr('string') declare letter?: string;
    //@attr('number') declare round?: number;
}
