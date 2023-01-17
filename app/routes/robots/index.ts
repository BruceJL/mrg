// import RefreshedRoute from '../RefreshedRoute';
import { service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import DS from 'ember-data';

export default class RobotsIndexRoute extends Route {
  @service declare store: DS.Store;

  async model() {
    return RSVP.hash({
      competition: this.store.findAll(
        'robot',
        {
          reload: true,
          include: 'competition',
        }
      ),
      // robot: this.store.findAll(
      //   'robot',
      //   {
      //     reload: true
      //   }),
    });
  }
}