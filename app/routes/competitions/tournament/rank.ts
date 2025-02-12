import Route from '@ember/routing/route';
import type TournamentModel from 'mrg-sign-in/models/tournament';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import RoundRobinService from 'mrg-sign-in/services/round-robin';
import RSVP from 'rsvp';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export type Ranking = {
  competitor_id: number,
  wins: number
}

export default class CompetitionsTournamentRankRoute extends Route {
  @service declare store: Services['store'];
  @service('round-robin') declare rrService: RoundRobinService;

  async model(params:any){

    const tournament:TournamentModel = await this.store.queryRecord('tournament', {"competition": params.competition_id, "ring": params.ring_number});

    // Fetch ranking data (contains competitor_id, wins)
    const res = await this.rrService.getRanking(tournament.id);
    const rankingData = await res.json();

    // Fetch robot objects for each competitor_id
    const robotPromises = rankingData.map(async (rank:Ranking) => {
      const robot = await this.store.findRecord('robot', rank.competitor_id);
      return {
        ...rank,
        robot
      };
    });

    const rankingWithRobots = await Promise.all(robotPromises);

    return RSVP.hash({
      tournament: tournament,
      ranking: rankingWithRobots
    });
  }
}
