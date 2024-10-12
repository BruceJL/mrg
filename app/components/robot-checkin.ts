import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotCheckinController extends Component {
  // Ember-Simple-Auth Session Typescript support info at:
  // https://github.com/mainmatter/ember-simple-auth/pull/2514
  @service declare session; //EmberSimpleAuthSession
  @service declare store: Services['store'];

  @action
  save(model: RobotModel) {
    model.save();
  }

  @action
  withdraw(model: RobotModel) {
    model.checkInStatus = 'WITHDRAWN';
    model.save();
    this.createLogEntry(model, 'WITHDRAWN');
  }

  @action
  reinstate(model: RobotModel) {
    model.checkInStatus = 'UNKNOWN';
    model.save();
    this.createLogEntry(model, 'RE-INSTATED');
  }

  @action
  checkIn(model: RobotModel) {
    model.checkInStatus = 'CHECKED-IN';
    model.save();
    this.createLogEntry(model, 'CHECKED-IN');
  }

  @action
  cancelCheckin(model: RobotModel) {
    model.checkInStatus = 'UNKNOWN';
    model.save();
    this.createLogEntry(model, 'CHECK-IN CANCELLED');
  }

  private createLogEntry(model: RobotModel, action: string) {
    const record = this.store.createRecord('activity-log', {
      volunteer: this.session.data.authenticated.fullname,
      robot: model,
      function: 'CHECK-IN',
      action: action,
    });
    record.save();
  }
}
