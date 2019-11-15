import Route from '@ember/routing/route';

export default class RobotsEditRoute extends Route {
  // putting this variable here makes it persistant across
  // visits to this page.
  selectedMeasurementOption = "Mass";
  Measurer = "Insert name here!";

  model(params) {
   return Ember.RSVP.hash({
     robot: this.store.findRecord('robot',
       params.robot_id, {
         include: 'robotMeasurement'
       }),
     competitions: this.store.findAll('competition'),
   });
 }
}
