import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetitionAdminRoute extends Route {
  @service store;

  model(params) {
    var store = this.store;
    this.set('params', params);
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
