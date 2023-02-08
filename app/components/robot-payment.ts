import Component from '@glimmer/component';
import {
  action,
} from '@ember/object';

import {
  tracked,
} from '@glimmer/tracking';

import {
  inject as service
} from '@ember/service';
import DS from 'ember-data';

import RobotModel from 'mrg-sign-in/models/robot';

export interface ComponentSignature{
  Args:{
    data: RobotModel,
  }
}

export default class RobotCheckinController extends Component<ComponentSignature> {
  @service declare session: any; //EmberSimpleAuthSession
  @service declare store: DS.Store;
  @tracked robot: RobotModel;

  constructor(
    owner: unknown,
    args: ComponentSignature['Args'],
  ) {
    super(owner, args);
    this.robot = this.args.data;
  }

  get PaymentOptions() {
    return [
      'CASH',
      'INVOICED',
      'CHEQUE',
      'CREDIT CARD',
      'COMPLEMENTARY'
    ];
  }

  get paymentSelectDisabled(): boolean {
    let b = ((this.robot.isPaid) && (this.robot.paymentType !== 'INVOICED'));
    return b;
  }

  @action
  save() {
    this.robot.save();
  }

  @action
  paid(
    amount: number,
  ): void {
    this.robot.paid = amount;
    this.robot.save();
    this.createLogEntry(
      "PAID $" + amount + " " + this.robot.paymentType,
    );
  }

  @action
  refund(): void {
    this.createLogEntry(
      "REFUNDED $" + this.robot.paid + " " + this.robot.paymentType,
    );
    this.robot.paid = 0.00;
    this.robot.paymentType = "UNPAID";
    this.robot.save();
  }

  @action
  selectPaymentType(
    value: ("UNPAID" | "CASH" | "CREDIT CARD" | "CHEQUE" | "INVOICED"),
  ): void {
    if (value === "INVOICED" && this.robot.paid > 0.0) {
      alert(
        "This entry is marked as PAID. Please refund the money before" +
        " marking the entry as INVOICED."
      );
    } else if(value === "INVOICED"){
      this.robot.paymentType = value;
      this.createLogEntry(
        "MARKED AS INVOICED",
      );
    } else {
      this.robot.paymentType = value;
      this.robot.save();
    }
  }

  private createLogEntry(
    action: string,
  ) {
    let store = this.store;
    let session = this.session;
    let record = store.createRecord('activity-log', {
      volunteer: session.data.authenticated.fullname,
      robot: this.robot,
      function: "PAYMENT",
      action: action,
    });
    record.save();
  }
}
