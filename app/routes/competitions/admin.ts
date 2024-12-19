import Route from '@ember/routing/route';
import { service } from '@ember/service';
import CompetitionModel from 'mrg-sign-in/models/competition';
import type { Registry as Services } from '@ember/service';
import type CompetitionAdminController from 'mrg-sign-in/controllers/competitions/admin';
import type Transition from '@ember/routing/transition';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class CompetitionAdminRoute extends Route {
  @service declare store: Services['store'];

  model(params: any): Promise<CompetitionModel> {
    return this.store.findRecord('competition', params.competition_id, {
      include: 'robot',
    });
  }

  setupController(controller:CompetitionAdminController, model: CompetitionModel, transition:Transition): void {
    super.setupController(controller, model, transition);
    controller.loadCurrentJudges();
  }
}
