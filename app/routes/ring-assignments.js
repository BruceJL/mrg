import RefreshedRoute from './RefreshedRoute';
import { inject as service } from '@ember/service';

export default class RingAssignmentRoute extends RefreshedRoute {
  @service store;

  model(params) {
    this.store.findAll('robot');
    this.store.findAll('ring-assignment', params.competition_id);
    return this.store.findRecord('competition', params.competition_id);
  }
}
