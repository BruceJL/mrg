import Component from '@ember/component';
import {
  get,
  set,
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


export default class RobotCheckinController extends Component {
  @service session;
  @service store;
  @computed()
  get PaymentOptions() {
    return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
  }

  @action
  save(model) {
    model.save();
  }

  @action
  paid(model, amount) {
    set(model, 'paid', amount);
    model.save();
    let store = get(this, 'store');
    this._createLogEntry(
      model,
      "PAID $" + amount + " " + get(model, 'paymentType'),
    );
  }

  @action
  refund(model) {
    let store = get(this, 'store');
    this._createLogEntry(
      model,
      "REFUNDED $" + get(model, 'paid') + " " + get(model, 'paymentType'),
    );
    set(model, 'paid', 0.00);
    set(model, 'paymentType', null);
    model.save();
  }

  @action
  selectPaymentType(model, value) {
    debug("selectPaymentType fired.");
    let store = get(this, 'store');
    if (value === "INVOICED" && get(model, 'paid') > 0.0) {
      alert(
        "This entry is marked as PAID. Please refund the money before" +
        " marking the entry as INVOICED."
      );
    } else if(value === "INVOICED"){
      model.set('paymentType', value);
      this._createLogEntry(
        model,
        "MARKED AS INVOICED",
      );
    } else {
      debug("setting paymentType to " + value);
      model.set('paymentType', value);
      model.save();
    }
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
