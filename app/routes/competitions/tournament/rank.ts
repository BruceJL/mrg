import Route from '@ember/routing/route';
import type TournamentModel from 'mrg-sign-in/models/tournament';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import RoundRobinService from 'mrg-sign-in/services/round-robin';
import RSVP from 'rsvp';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class CompetitionsTournamentRankRoute extends Route {
  @service declare store: Services['store'];
  @service('round-robin') declare rrService: RoundRobinService;

  async model(params:any){

    const tournament:TournamentModel = await this.store.queryRecord('tournament', {"competition": params.competition_id, "ring": params.ring_number});

    const res = await this.rrService.getRanking(tournament.id);
    return RSVP.hash({
      tournament: tournament,
      ranking: res.json()
    });
  }
}
