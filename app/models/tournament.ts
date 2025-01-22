// app/models/tournament.ts
import Model, { attr, belongsTo, hasMany,type AsyncBelongsTo, type SyncHasMany} from '@ember-data/model';
import type CompetitionModel from './competition';
import type Match from './match'

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
  }) declare matches: SyncHasMany<Match>;

}
