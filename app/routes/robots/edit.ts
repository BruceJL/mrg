import { service } from '@ember/service';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import DS from 'ember-data';
//@ts-ignore
import AuthenticatedRoute from '../authenticated';

export default class RobotsEditRoute extends AuthenticatedRoute {
  @service declare store: DS.Store;

  async model(params: any) {
   return RSVP.hash({
     competition: this.store.findAll('competition'),
     robot: this.store.findRecord('robot', params.robot_id,
       {
         include: 'competition, measurement'
       }),
   });
  }

  async beforeModel(transition: any) {
    await this.session.setup();
    return super.beforeModel(transition);
  }
}
