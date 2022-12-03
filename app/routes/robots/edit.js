import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RobotsEditRoute extends Route {
  @service store;

  model(params) {
   return hash({
     robot: this.store.findRecord('robot',
       params.robot_id, {
         include: 'robotMeasurement'
       }),
     competitions: this.store.findAll('competition'),
   });
 }
}
