import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RobotModel from 'mrg-sign-in/models/robot';
import type { Registry as Services } from '@ember/service';

export default class RobotsIndexRoute extends Route {
  @service declare store: Services['store'];

  model(): Promise<Array<RobotModel>> {
    return this.store.findAll('robot', {
      include: 'competition',
    });
  }
}
