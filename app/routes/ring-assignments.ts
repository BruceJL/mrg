import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class RingAssignmentRoute extends Route {
  @service declare store: Services['store'];

  async model(params: any) {
    // Fetch the competition to make sure robot's competition attribute is loaded
    const competition = await this.store.findRecord(
      'competition',
      params.competition_id,
    );

    // Fetch tournaments for the competition
    const tournaments = await this.store.query('tournament', {
      competition: params.competition_id,
    });

    // Fetch robots for the competition
    await this.store.query('robot', {
      competition: params.competition_id,
    });

    tournaments.forEach(async (tournament) => {
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

    return tournaments;
  }
}
