import RefreshedRoute from  '../RefreshedRoute';
import { inject as service } from '@ember/service';

export default class RobotsBulkPaymentRoute extends RefreshedRoute {
  @service store;
  model() {

    this.store.findAll('competition',
    );

    return this.store.findAll('robot',
    {
      include: 'competition',
    });
  }
}
