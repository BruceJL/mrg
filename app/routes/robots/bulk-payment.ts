import { service } from '@ember/service';
import Route from '@ember/routing/route';
import RobotModel from 'mrg-sign-in/models/robot';
import type { Registry as Services } from '@ember/service';

export type Resolved<P> = P extends Promise<infer T> ? T : P;
export type ModelFrom<R extends Route> = Resolved<ReturnType<R['model']>>;

export default class RobotsBulkPaymentRoute extends Route {
  @service declare store: Services['store'];

  model(): Promise<Array<RobotModel>> {
    return this.store.findAll('robot', {
      include: 'competition',
    });
  }
}
