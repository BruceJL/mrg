import Route from '@ember/routing/route';

export default class RobotsBulkPaymentRoute extends Route {
  model() {

    this.store.findAll('competition', {
      reload: true
    });

    return this.store.findAll('robot', {
      reload: true
    });
  }
}
