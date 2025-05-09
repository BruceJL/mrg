import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import RobotModel from 'mrg-sign-in/models/robot';
import type { Registry as Services } from '@ember/service';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { notEq } from 'ember-truth-helpers';


export interface ComponentSignature {
  Args: {
    data: RobotModel;
  };
}

export default class RobotCheckinController extends Component<ComponentSignature> {
  // See https://github.com/mainmatter/ember-simple-auth/pull/2514 for below.
  @service declare session; //EmberSimpleAuthSession
  @service declare store: Services['store'];
  @tracked robot: RobotModel;

  constructor(owner: unknown, args: ComponentSignature['Args']) {
    super(owner, args);
    this.robot = this.args.data;
  }

  get PaymentOptions() {
    return ['CASH', 'INVOICED', 'CHEQUE', 'CREDIT CARD', 'COMPLEMENTARY'];
  }

  get paymentSelectDisabled(): boolean {
    return this.robot.isPaid && this.robot.paymentType !== 'INVOICED';
  }

  @action
  save() {
    this.robot.save();
  }

  @action
  paid(amount: number): void {
    this.robot.paid = amount;
    this.robot.save();
    this.createLogEntry('PAID $' + amount + ' ' + this.robot.paymentType);
  }

  @action
  refund(): void {
    this.createLogEntry(
      'REFUNDED $' + this.robot.paid + ' ' + this.robot.paymentType,
    );
    this.robot.paid = 0.0;
    this.robot.paymentType = 'UNPAID';
    this.robot.save();
  }

  @action
  selectPaymentType(
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    if (value === 'INVOICED' && this.robot.paid > 0.0) {
      alert(
        'This entry is marked as PAID. Please refund the money before' +
          ' marking the entry as INVOICED.',
      );
    } else if (value === 'INVOICED') {
      this.robot.paymentType = value;
      this.createLogEntry('MARKED AS INVOICED');
    } else {
      this.robot.paymentType = value;
      this.robot.save();
    }
  }

  private createLogEntry(action: string) {
    const store = this.store;
    const session = this.session;
    const record = store.createRecord('activity-log', {
      volunteer: session.data.authenticated.fullname,
      robot: this.robot,
      function: 'PAYMENT',
      action: action,
    });
    record.save();
  }

  <template>
    <h3>Payment Information</h3>
    <table class="form">
      <tbody>
        <tr>
          <td>Fee:</td>
          <td colspan="2">{{@data.formattedInvoicedDollars}}</td>
        </tr>
        <tr>
          <td>Paid:</td>
          <td>
            <select
              aria-label="Select Payment Type"
              {{on "change" this.selectPaymentType}}
              disabled={{this.paymentSelectDisabled}}
            >
              <option value="" selected={{eq @data.paymentType null}} disabled={{true}}>
                Select payment method
              </option>
              {{#each this.PaymentOptions as |o|}}
                <option value={{o}} selected={{eq @data.paymentType o}}>
                  {{o}}
                </option>
              {{/each}}
            </select>
          </td>
          <td colspan="2">
            {{#if (eq @data.paymentType "INVOICED") }}
                Invoiced
            {{else if (eq @data.paymentType "COMPLEMENTARY")}}
                Complementary
            {{else if (notEq @data.paymentType null)}}
              {{#if @data.isPaid}}
                {{@data.formattedPaidDollars}}
                <button type="button" {{on "click" this.refund}}>Refund</button>
              {{else}}
                <button type="button" {{on "click" (fn this.paid "5")}}>Paid $5.00</button><br>
                <button type="button" {{on "click" (fn this.paid "10")}}>Paid $10.00</button>
              {{/if}}
            {{/if}}
          </td>
        </tr>
      </tbody>
    </table>
  </template>
}
