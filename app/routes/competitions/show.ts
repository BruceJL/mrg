import Route from '@ember/routing/route';
import { service } from '@ember/service';
import CompetitionModel from 'mrg-sign-in/models/competition';
import type { Registry as Services } from '@ember/service';

export default class CompetitionShowRoute extends Route {
  @service declare store: Services['store'];

  model(params: any): Promise<CompetitionModel> {
    return this.store.queryRecord('competition', {
      id: params.competition_id,
      year: new Date().getFullYear(),
      select: '*,robot(*)'
    });
  }
}
