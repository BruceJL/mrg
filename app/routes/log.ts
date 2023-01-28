import { inject as service } from '@ember/service';
import DS from 'ember-data';
import RSVP from 'rsvp';
import AuthenticatedRoute from './authenticated';

export default class LogRoute extends AuthenticatedRoute {
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
