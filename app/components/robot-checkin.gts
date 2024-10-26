import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import { on } from '@ember/modifier'
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import momentFormat from 'ember-moment/helpers/moment-format';

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
  <template>
    <h3>Check-in Information</h3>
    <table class="form">
      <tbody>
        <tr>
          <td>Registered:</td>
          <td colspan="2">{{momentFormat @data.registered "YYYY MMM DD, h:mm:ss"}}</td>
        </tr>
        <tr>
          <td>Checked in:</td>
          <td>{{@data.checkInStatus}}</td>
          <td>
            {{#if (eq @data.checkInStatus "CHECKED-IN")}}
              <button type="button" {{on "click" (fn this.cancelCheckin @data)}}>
                Cancel Check in
              </button>
            {{else if (eq @data.checkInStatus "WITHDRAWN")}}
              <button type="button" {{on "click" (fn this.reinstate @data)}}>
                Reinstate
              </button>
            {{else}}
              <button type="button" {{on "click" (fn this.checkIn @data)}}>Check in</button>
              <button type="button" {{on "click" (fn this.withdraw @data)}}>Withdraw</button>
            {{/if}}
          </td>
        </tr>
        <tr>
          <td>Slotting Status:</td>
          <td>{{@data.slottedStatus}}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

  </template>
}
