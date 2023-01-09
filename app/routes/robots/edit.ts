import { service } from '@ember/service';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import DS from 'ember-data';

export default class RobotsEditRoute extends Route {
  @service declare store: DS.Store;

  model(params: any) {
   return RSVP.hash({
     competitions: this.store.findAll('competition'),
     robot: this.store.findRecord('robot',
       params.robot_id, {
         include: 'robot-measurement'
       }),
   });
 }
}
