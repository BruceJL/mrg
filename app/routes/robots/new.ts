import { hash } from 'rsvp';
import { service } from '@ember/service';
import Route from '@ember/routing/route';
import type { Registry as Services } from '@ember/service';

export default class RobotsNewRoute extends Route {
  @service declare store: Services['store'];

  async model(params: any) {
    let store = this.store;
    let robot = await store.createRecord('robot');
    let competitions = await store.findAll('competition');
    robot.competition = store.peekRecord('competition', params.competition);

    return hash({
      competitions: competitions,
      robot: robot,
    });
  }
}
