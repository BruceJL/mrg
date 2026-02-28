import Route from '@ember/routing/route';
import { service } from '@ember/service';
import CompetitionModel from 'mrg-sign-in/models/competition';
import type { Registry as Services } from '@ember/service';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class CompetitionAdminRoute extends Route {
  @service declare store: Services['store'];

  model(params: any): Promise<CompetitionModel> {
    return this.store.queryRecord('competition', {
      id: params.competition_id,
      year: new Date().getFullYear(),
      select: '*,robot(*)'
    });
  }
}
