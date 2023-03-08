import { inject as service } from '@ember/service';
import DS from 'ember-data';
import AuthenticatedRoute from '../authenticated';
import Route from '@ember/routing/route';
import RobotModel from 'mrg-sign-in/models/robot';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class RobotsBulkPaymentRoute extends AuthenticatedRoute {
  @service declare store: DS.Store;

  model(): DS.PromiseArray<RobotModel> {
    return this.store.findAll('robot',
      {
        include: 'competition',
      }
    );
  }
}
