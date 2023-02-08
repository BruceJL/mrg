import { service } from '@ember/service';
import RSVP from 'rsvp';
import DS from 'ember-data';
import AuthenticatedRoute from '../authenticated';

export default class RobotsIndexRoute extends AuthenticatedRoute {
  @service declare store: DS.Store;

  async model() {
    return this.store.findAll(
      'robot',
      {
        include: 'competition',
      }
    )
  }
}