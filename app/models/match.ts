import Model, { belongsTo, attr, type AsyncBelongsTo } from '@ember-data/model';
import type CompetitionModel from './competition';
import type TournamentModel from './tournament';
import type RobotModel from './robot';

export default class MatchModel extends Model {
  @attr('number') declare ring: number;
  @attr('number') declare contestant1: number;
  @attr('number') declare contestant2: number;

  @belongsTo('competition',{
    async:true,
    inverse:null,
  })
  declare competition: AsyncBelongsTo<CompetitionModel>;

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
    inverse:'matches',
  }) declare tournament: AsyncBelongsTo<TournamentModel>;

  @attr('number') declare round1winner: number; // 0 for not played, 1 for competitor1, 2 for competitor2
  @attr('number') declare round2winner: number;
}
