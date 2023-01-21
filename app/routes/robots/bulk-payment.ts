
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import DS from 'ember-data';

export default class RobotsBulkPaymentRoute extends Route {
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
