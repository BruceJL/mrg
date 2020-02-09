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

export default class RobotCheckinController extends Component {

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
    cs.set('paid', amount);
    cs.save();
  }

  @action
  refund(cs) {
    cs.set('paid', 0.00);
    cs.set('paymentType', null);
    cs.save();
  }

  @action
  selectPaymentType(cs, value) {
    if (value === "INVOICED" && cs.get('paid') > 0.0) {
      alert("This entry is marked as PAID. Please refund the money before"
      + " marking the entry as INVOICED.");
      cs.rollback()
    } else {
      cs.set('paymentType', value);
      cs.save();
    }
  }
}
