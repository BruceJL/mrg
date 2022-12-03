import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RobotsNewRoute extends Route {
  @service store

  model() {
    let store = this.store;
    return hash({
      competitions: store.findAll('competition'),
      robot: store.createRecord('robot'),
    });
  }

  setupController(controller) {
     super.setupController(...arguments);
     controller.setupNewRobot();
   }
}
