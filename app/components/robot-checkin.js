import Component from '@ember/component';
import {
  get,
  action,
  computed,
} from '@ember/object';

import {
  inject as service
} from '@ember/service';

export default class RobotCheckinController extends Component {
  @service store;
  @service session;

  @computed()
  get PaymentOptions() {
    return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
  }

  @action
  save(model) {
    model.save();
  }

  @action
  withdraw(model) {
    model.set('withdrawn', true); //Depreciated
    model.set('status', "WITHDRAWN")
    model.save();
    this._createLogEntry(model, "WITHDRAWN");
  }

  @action
  reinstate(model) {
    model.set('withdrawn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
    this._createLogEntry(model, "RE-INSTATED");
  }

  @action
  checkIn(model) {
    model.set('signedIn', true); //depreciated
    model.set('status', "CHECKED-IN")
    model.save();
    this._createLogEntry(model, "CHECKED-IN");
  }

  @action
  cancelCheckin(model) {
    model.set('signedIn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
    this._createLogEntry(model, "CHECK-IN CANCELLED");
  }

  _createLogEntry(model, action) {
    let store = get(this, 'store');
    let session = get(this, 'session')
    let record = store.createRecord('activity-log', {
      volunteer: session.data.authenticated.fullname,
      entry: model,
      function: "PAYMENT",
      action: action,
    });
    record.save();
  }
}
