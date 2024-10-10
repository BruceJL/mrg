import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import RSVP from 'rsvp';

export default class LogRoute extends Route {
  @service declare store: DS.Store;

  async model() {
    return RSVP.hash({
      competition: this.store.findAll(
        'robot',
        {
          include: 'competition',
        }
      ),
    });
  }

}
