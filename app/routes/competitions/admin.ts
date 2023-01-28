import { inject as service } from '@ember/service';
import DS from 'ember-data';
import AuthenticatedRoute from '../authenticated';

export default class CompetitionAdminRoute extends AuthenticatedRoute {
  @service declare store: DS.Store;

  model(params: any) {
    let store = this.store;
    //this.set('params', params);
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
