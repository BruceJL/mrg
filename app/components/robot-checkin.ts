import Component from '@glimmer/component';
import {
  action,
} from '@ember/object';

import {
  inject as service
} from '@ember/service';

import DS from 'ember-data';

import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotCheckinController extends Component {
  @service declare session: any; //EmberSimpleAuthSession
  @service declare store: DS.Store;

  get PaymentOptions() {
    return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
  }

  @action
  save(model: RobotModel) {
    model.save();
  }

  @action
  withdraw(model: RobotModel) {
    model.status = "WITHDRAWN";
    model.save();
    this.createLogEntry(model, "WITHDRAWN");
  }

  @action
  reinstate(model: RobotModel) {
    model.status = "UNKNOWN";
    model.save();
    this.createLogEntry(model, "RE-INSTATED");
  }

  @action
  checkIn(model: RobotModel) {
    model.status = "CHECKED-IN";
    model.save();
    this.createLogEntry(model, "CHECKED-IN");
  }

  @action
  cancelCheckin(model: RobotModel) {
    model.status = "UNKNOWN";
    model.save();
    this.createLogEntry(model, "CHECK-IN CANCELLED");
  }

  private createLogEntry(model: RobotModel, action: string) {
    let record = this.store.createRecord('activity-log',
    {
      volunteer: this.session.data.authenticated.fullname,
      robot: model,
      function: "PAYMENT",
      action: action,
    });
    record.save();
  }
}
