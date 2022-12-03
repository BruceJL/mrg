import RefreshedRoute from '../RefreshedRoute';
import { inject as service } from '@ember/service';

export default class RobotsIndexRoute extends RefreshedRoute {
  @service store;

  model() {
    this.store.findAll('competition', {
      reload: true
    });
    return this.store.findAll('robot', {
      reload: true
    });
  }
};
