import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

export default class RingAssignmentRoute extends Route {
  @service declare store: DS.Store;

  model(params: any) {
    return this.store.findRecord(
      'competition', params.competition_id,  {
        include: 'robot, ringAssignment',
      });
  }
}
