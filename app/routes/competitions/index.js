import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetitionIndexRoute extends Route {
  @service store;

  model() {
    this.store.findAll('robot', {
      reload: true
    });
    return this.store.findAll('competition', {
      reload: true
    });
  }
}
