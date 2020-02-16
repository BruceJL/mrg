import Component from '@ember/component';
import {
  action,
  computed,
} from '@ember/object';
import {
  tracked,
} from '@glimmer/tracking';
import {
  debug,
} from '@ember/debug';

import {
  inject as service
} from '@ember/service';

function createLogEntry(store, entry, action) {
  let record = store.createRecord('activity-log', {
    datetime: new Date('1970-01-01T00:00:00Z'),
    volunteer: "Nobody",
    entry: entry,
    function: "CHECK-IN",
    action: action,
  });
  record.save();
}

export default class RobotCheckinController extends Component {
  @service store;

  @computed()
  get PaymentOptions() {
    return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
  }

  @action
  save(model) {
    console.log("Saving model");
    model.save();
  }

  @action
  withdraw(model) {
    model.set('withdrawn', true); //Depreciated
    model.set('status', "WITHDRAWN")
    model.save();
    createLogEntry(
      this.store,
      model,
      "WITHDRAWN",
    );
  }

  @action
  reinstate(model) {
    model.set('withdrawn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
    createLogEntry(
      this.store,
      model,
      "RE-INSTATED",
    );
  }

  @action
  checkIn(model) {
    model.set('signedIn', true); //depreciated
    model.set('status', "CHECKED-IN")
    model.save();
    createLogEntry(
      this.store,
      model,
      "CHECKED-IN",
    );
  }

  @action
  cancelCheckin(model) {
    model.set('signedIn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
    createLogEntry(
      this.store,
      model,
      "CHECK-IN CANCELLED",
    );
  }
}
