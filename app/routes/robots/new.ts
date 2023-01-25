import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

export default class RobotsNewRoute extends Route {
  @service declare store: DS.Store;

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
