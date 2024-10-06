import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import type { Registry as Services } from '@ember/service';

export default class LogRoute extends Route {
  @service declare store: Services['store'];

  async model() {
    return RSVP.hash({
      competition: this.store.findAll('robot', {
        include: 'competition',
      }),
    });
  }
}
