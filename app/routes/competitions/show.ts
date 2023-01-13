//import RefreshedRoute from '../RefreshedRoute';
import Route from '@ember/routing/route';

import { service } from '@ember/service';
import DS from 'ember-data';

export default class CompetitionShowRoute extends Route { //RefreshedRoute
  @service declare store: DS.Store;

  model(params: any) {
      return this.store.findRecord(
          'competition',
          params.competition_id,
          {
            include: 'robot'
          }
      );
  }
}
