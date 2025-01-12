import Model, { belongsTo, attr, type AsyncBelongsTo } from '@ember-data/model';
import type TournamentModel from './tournament';
import type RobotModel from './robot';

export default class MatchModel extends Model {
  @belongsTo('robot', {
    async: true,
    inverse: null,
  })
  declare competitor1: AsyncBelongsTo<RobotModel>;

  @belongsTo('robot', {
    async: true,
    inverse: null,
  })
  declare competitor2: AsyncBelongsTo<RobotModel>;

  @belongsTo('tournament',{
    async:true,
    // inverse:'match',
    inverse: null,
  }) declare tournament: AsyncBelongsTo<TournamentModel>;

  @attr('number') declare round1winner: number; // 0 for not played, 1 for competitor1, 2 for competitor2
  @attr('number') declare round2winner: number;
  @attr('number') declare round3winner: number;
}
