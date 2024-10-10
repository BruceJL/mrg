import Route from '@ember/routing/route';
import { service } from '@ember/service';
import DS from 'ember-data';
import CompetitionModel from 'mrg-sign-in/models/competition';

export default class CompetitionShowRoute extends Route {
  @service declare store: DS.Store;

  model(params: any): DS.PromiseObject<CompetitionModel> {
      return this.store.findRecord(
          'competition',
          params.competition_id,
          {
            include: 'robot',
          }
      );
  }
}
