import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import CompetitionModel from 'mrg-sign-in/models/competition';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class RingAssignmentRoute extends Route {
  @service declare store: DS.Store;

  model(params: any): DS.PromiseObject<CompetitionModel> {
    return this.store.findRecord(
      'competition', params.competition_id,  {
        include: 'robot, ringAssignment',
      }
    );
  }
}
