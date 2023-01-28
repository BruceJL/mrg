import { service } from '@ember/service';
import DS from 'ember-data';
import AuthenticatedRoute from '../authenticated';

export default class CompetitionShowRoute extends AuthenticatedRoute { //RefreshedRoute
  @service declare store: DS.Store;

  model(params: any) {
      return this.store.findRecord(
          'competition',
          params.competition_id,
          {
            include: 'robot',
          }
      );
  }
}
