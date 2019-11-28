import {
  debug,
} from '@ember/debug';

import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';

export default class RobotsNewRoute extends Route {

  model() {
    let store = this.store;
    return hash({
      competitions: store.findAll('competition'),
      robot: store.createRecord('robot'),
    });
  }

  setupController(controller) {
     let store = this.store;
     super.setupController(...arguments);
     controller.setupNewRobot();
   }
}
