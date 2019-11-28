import {
  hash
} from 'rsvp';

import Route from '@ember/routing/route';

export default class RobotsEditRoute extends Route {
  // putting this variable here makes it persistant across
  // visits to this page.
  selectedMeasurementOption = "Mass";
  Measurer = "Insert name here!";

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
