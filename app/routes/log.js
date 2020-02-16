import Route from '@ember/routing/route';

export default class LogRoute extends Route {
  model() {
    this.store.findAll('robot');
    return this.store.findAll('activity-log');
  }
}
