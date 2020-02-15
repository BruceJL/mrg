import RefreshedRoute from  '../RefreshedRoute';

export default class RobotsBulkPaymentRoute extends RefreshedRoute {
  model() {

    this.store.findAll('competition', {
      reload: true
    });

    return this.store.findAll('robot', {
      reload: true
    });
  }
}
