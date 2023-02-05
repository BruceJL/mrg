import Component from '@glimmer/component';
import {
  action,
} from '@ember/object';

import {
  debug,
} from '@ember/debug';

import {
  inject as service
} from '@ember/service';
import DS from 'ember-data';

import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotCheckinController extends Component {
  @service declare session: any; //EmberSimpleAuthSession
  @service declare store: DS.Store;

  get PaymentOptions() {
    return [
      'CASH',
      'INVOICED',
      'CHEQUE',
      'CREDIT CARD',
      'COMPLEMENTARY'
    ];
  }

  @action
  save(model: RobotModel) {
    model.save();
  }

  @action
  paid(
    model: RobotModel,
    amount: number
  ): void {
    model.paid = amount;
    model.save();
    this.createLogEntry(
      model,
      "PAID $" + amount + " " + model.paymentType,
    );
  }

  @action
  refund(model: RobotModel): void {
    this.createLogEntry(
      model,
      "REFUNDED $" + model.paid + " " + model.paymentType,
    );
    model.paid = 0.00;
    model.paymentType = "UNPAID";
    model.save();
  }

  @action
  selectPaymentType(
    model: RobotModel,
    value: ("UNPAID" | "CASH" | "CREDIT CARD" | "CHEQUE" | "INVOICED"),
  ): void {
    debug("selectPaymentType fired.");
    if (value === "INVOICED" && model.paid > 0.0) {
      alert(
        "This entry is marked as PAID. Please refund the money before" +
        " marking the entry as INVOICED."
      );
    } else if(value === "INVOICED"){
      model.paymentType = value;
      this.createLogEntry(
        model,
        "MARKED AS INVOICED",
      );
    } else {
      debug("setting paymentType to " + value);
      model.paymentType = value;
      model.save();
    }
  }

  private createLogEntry(model: RobotModel, action: string) {
    let store = this.store;
    let session = this.session;
    let record = store.createRecord('activity-log', {
      volunteer: session.data.authenticated.fullname,
      robot: model,
      function: "PAYMENT",
      action: action,
    });
    record.save();
  }
}
