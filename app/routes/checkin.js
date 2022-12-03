
import RefreshedRoute from './RefreshedRoute';
import { inject as service } from '@ember/service';

export default class CheckinRoute extends RefreshedRoute {
  @service store;
  model(params) {
    this.set('params', params);
    return this.store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
