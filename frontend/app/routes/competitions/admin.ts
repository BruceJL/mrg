import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import CompetitionModel from 'mrg-sign-in/models/competition';

export default class CompetitionAdminRoute extends Route {
  @service declare store: DS.Store;

  model(params: any): DS.PromiseObject<CompetitionModel>{
    let store = this.store;
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
