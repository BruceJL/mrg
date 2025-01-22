import Route from '@ember/routing/route';
import TournamentModel from 'mrg-sign-in/models/tournament';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class CompetitionsTournamentRoute extends Route{
  @service declare store: Services['store'];

  async model(params:any):Promise<TournamentModel> {

    // Fetch the tournament
    const tournament = await this.store.queryRecord('tournament', {
      "competition": params.competition_id,
      "ring": params.ring_number,
    });

    // Fetch the matches
    const matches = await this.store.query('match', {
      "tournament": tournament.id,
    });

    tournament.matches = matches;
    return tournament;
  }
}
