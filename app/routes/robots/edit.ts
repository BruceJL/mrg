import { service } from '@ember/service';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import type { Registry as Services } from '@ember/service';

export default class RobotsEditRoute extends Route {
  @service declare store: Services['store'];

  async model(params: any) {
    return RSVP.hash({
      competition: this.store.findAll('competition'),
      robot: this.store.findRecord('robot', params.robot_id, {
        include: 'competition, measurement',
      }),
    });
  }
}
