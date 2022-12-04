// import RefreshedRoute from '../RefreshedRoute';
import { service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import DS from 'ember-data';

export default class RobotsIndexRoute extends Route {
  @service declare store: DS.Store;

  model() {
    return RSVP.hash({
      competition: this.store.findAll('competition', {reload: true}),
      robot: this.store.findAll('robot', {reload: true}),
      ringAssignment: this.store.findAll('ringAssignment', {reload: true}),
    });
  }
}
