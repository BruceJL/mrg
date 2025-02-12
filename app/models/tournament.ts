// app/models/tournament.ts
import Model, { attr, belongsTo, hasMany,type AsyncBelongsTo, type SyncHasMany} from '@ember-data/model';
import type CompetitionModel from './competition';
import type MatchModel from './match'
import type RingAssignmentModel from './ring-assignment';

export default class TournamentModel extends Model {
  @attr('number') declare ring: number;
  @attr('string') declare judge: string;
  @attr('string') declare timer: string;

  @belongsTo('competition', {
    async: true,
    inverse:null,
  }) declare competition: AsyncBelongsTo<CompetitionModel>;

  @hasMany('match',{
    async:false,
    inverse:null,
  }) declare matches: SyncHasMany<MatchModel>;

  @hasMany('ring-assignment', {
      async: false,
      inverse: null,
    }) declare ringAssignments: SyncHasMany<RingAssignmentModel>;
}
