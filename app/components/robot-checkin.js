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
  save(model) {
    console.log("Saving model");
    model.save();
  }

  @action
  withdraw(model) {
    model.set('withdrawn', true); //Depreciated
    model.set('status', "WITHDRAWN")
    model.save();
  }

  @action
  reinstate(model) {
    model.set('withdrawn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
  }

  @action
  checkIn(model) {
    model.set('signedIn', true); //depreciated
    model.set('status', "CHECKED-IN")
    model.save();
  }

  @action
  cancelCheckin(model) {
    model.set('signedIn', false); //depreciated
    model.set('status', "UNKNOWN")
    model.save();
  }

  @action
  paid5Dollars(model) {
    model.set('paid', 5.00);
    model.save();
  }

  @action
  paid10Dollars(model) {
    model.set('paid', 10.00);
    model.save();
  }

  @action
  refund(model) {
    model.set('paid', 0.00);
    model.set('paymentType', null);
    model.save();
  }

  @action
  selectPaymentType(model, value){
    model.set('paymentType', value)
    model.save();
  }
}
