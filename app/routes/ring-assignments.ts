import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import type TournamentModel from 'mrg-sign-in/models/tournament';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class RingAssignmentRoute extends Route {
  @service declare store: Services['store'];

  async model(params: any) {

    const competition = await this.store.findRecord('competition', params.competition_id, {
      include: 'tournament, robot',
    });

    const tournaments = competition.tournament;

    const promises = tournaments.map(async (tournament:TournamentModel) => {
      // Fetch ring assignments for each tournament
      const ringAssignments = await this.store.query('ringAssignment', {
        tournament: tournament.id,
      });

      const sortedRingAssignments = Object.values(ringAssignments).sort(
        (a, b) => {
          return a.robot.name.localeCompare(b.robot.name);
        },
      );

      tournament.set('ringAssignments', sortedRingAssignments);
    });

    await Promise.all(promises);

    return tournaments;
  }
}
