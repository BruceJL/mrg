import RefreshedRoute from '../RefreshedRoute';
import { inject as service } from '@ember/service';

export default class CompetitionShowRoute extends RefreshedRoute {
  @service store;

  model(params) {
    let store = this.store;
    this.set('params', params);

    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
