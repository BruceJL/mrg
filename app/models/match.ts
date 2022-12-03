import Model, {
  hasMany,
  belongsTo,
  attr,
  type AsyncBelongsTo,
  type AsyncHasMany,
} from '@ember-data/model';

import type CompetitionModel from './competition';
import type RobotModel from './robot';

export default class MatchModel extends Model {
    @attr('number') declare round: number;
    @attr('number') declare ring: number;

    @belongsTo('competition',
    ) declare competition: AsyncBelongsTo<CompetitionModel>;

    @belongsTo('robot', {
      async: true,
      inverse: null,
    }) declare competitor1: AsyncBelongsTo<RobotModel>;

    @belongsTo('robot', {
      async: true,
      inverse: null,
    }) declare competitor2: AsyncBelongsTo<RobotModel>;

    @attr('number') declare competitor1Wins: number;
    @attr('number') declare competitor2Wins: number;
}
