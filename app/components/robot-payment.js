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
  save(cs) {
    cs.save();
  }

  @action
  paid(cs, amount) {
    set(cs, 'paid', amount);
    cs.save();
    let store = get(this, 'store');
    this._createLogEntry(
      cs.get('_internalModel'),
      "PAID $" + amount + " " + get(cs, 'paymentType'),
    );
  }

  @action
  refund(cs) {
    let store = get(this, 'store');
    this._createLogEntry(
      cs.get('_internalModel'),
      "REFUNDED $" + get(cs, 'paid') + " " + get(cs, 'paymentType'),
    );
    set(cs, 'paid', 0.00);
    set(cs, 'paymentType', null);
    cs.save();
  }

  @action
  selectPaymentType(cs, value) {
    debug("selectPaymentType fired.");
    let store = get(this, 'store');
    if (value === "INVOICED" && get(cs, 'paid') > 0.0) {
      alert(
        "This entry is marked as PAID. Please refund the money before" +
        " marking the entry as INVOICED."
      );
      cs.rollback()
    } else if(value === "INVOICED"){
      cs.set('paymentType', value);
      this._createLogEntry(
        cs.get('_internalModel'),
        "MARKED AS INVOICED",
      );
    } else {
      debug("setting paymentType to " + value);
      cs.set('paymentType', value);
      cs.save();
    }
  }

  _createLogEntry(model, action) {
    let store = get(this, 'store');
    let session = get(this, 'session')
    let record = store.createRecord('activity-log', {
      datetime: new Date('1970-01-01T00:00:00Z'),
      volunteer: session.data.authenticated.fullname,
      entry: model,
      function: "PAYMENT",
      action: action,
    });
    record.save();
  }
}
