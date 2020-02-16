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

function createLogEntry(store, entry, action) {
  let record = store.createRecord('activity-log', {
    datetime: new Date('1970-01-01T00:00:00Z'),
    volunteer: "Nobody",
    entry: entry,
    function: "PAYMENT",
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
  save(cs) {
    cs.save();
  }

  @action
  paid(cs, amount) {
    set(cs, 'paid', amount);
    cs.save();
    let store = get(this, 'store');
    createLogEntry(
      store,
      cs.get('_internalModel'),
      "PAID $" + amount + " " + get(cs, 'paymentType')
    );
  }

  @action
  refund(cs) {
    let store = get(this, 'store');
    createLogEntry(
      store,
      cs.get('_internalModel'),
      "REFUNDED $" + get(cs, 'paid') + " " + get(cs, 'paymentType')
    );
    set(cs, 'paid', 0.00);
    set(cs, 'paymentType', null);
    cs.save();
  }

  @action
  selectPaymentType(cs, value) {
    let store = get(this, 'store');
    if (value === "INVOICED" && get(cs, 'paid') > 0.0) {
      alert(
        "This entry is marked as PAID. Please refund the money before" +
        " marking the entry as INVOICED."
      );
      cs.rollback()
    } else if(value === "INVOICED"){
      cs.set('paymentType', value);
      createLogEntry(
        store,
        cs.get('_internalModel'),
        "MARKED AS INVOICED");
    } else {
      cs.set('paymentType', value);
      cs.save();
    }
  }
}
