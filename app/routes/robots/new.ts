import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

export default class RobotsNewRoute extends Route {
  @service declare store: DS.Store;

  model() {
    let store = this.store;
    return hash({
      competitions: store.findAll('competition'),
      robot: store.createRecord('robot'),
    });
  }

  // setupController(controller: any) {
  //    super.setupController(controller);
  //    controller.setupNewRobot();
  //  }
}
