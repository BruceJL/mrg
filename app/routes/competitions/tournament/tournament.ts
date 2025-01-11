import Route from '@ember/routing/route';
import TournamentModel from 'mrg-sign-in/models/tournament';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import { hash } from 'rsvp';


export default class CompetitionsTournamentRoute extends Route {
  @service declare store: Services['store'];

  async model(params:any){

    // Fetch tournament and matches concurrently
    const tournamentPromise: Promise<TournamentModel> = this.store.queryRecord('tournament', {
      competition: params.competition_id,
      ring: params.ring_number,
    });

    const matchesPromise = this.store.query('match', {
      competition: params.competition_id,
      ring: params.ring_number,
    });

    // Resolve both promises concurrently
    const [tournament, matches] = await Promise.all([tournamentPromise, matchesPromise]);

    tournament.set('matches', matches);

    return hash(
      {
        tournament: tournament,
        competition_id: params.competition_id,
      }
    );
  }
}
