import { inject as service } from '@ember/service';
import DS from 'ember-data';
import AuthenticatedRoute from '../authenticated';

export default class RobotsBulkPaymentRoute extends AuthenticatedRoute {
  @service declare store: DS.Store;

  model() {
    this.store.findAll('competition');

    this.store.findAll('robot',
      {
        include: 'competition',
      }
    );
  }
}
