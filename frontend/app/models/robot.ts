import Model, {
  hasMany,
  belongsTo,
  attr,
  type SyncHasMany,
} from '@ember-data/model';

import type CompetitionModel from './competition';
import type RobotMeasurementModel from './measurement';
import RingAssignmentModel from './ring-assignment';

function formatDollars(
  amount: number,
): string {
  amount = Number(amount);
  if (!isNaN(amount) && amount > 0) {
    return '$' + amount.toFixed(2);
  } else {
    return "";
  }
}

export default class RobotModel extends Model {

  // competitor information
  @attr('string') declare name: string; // Robot Name
  @attr('string') declare driver1: string; // Driver1 name
  @attr('string') declare driver1gr: string; // Driver 1 grade
  @attr('string') declare driver2?: string; // Driver 2 name
  @attr('string') declare driver2gr?: string; // Driver 2 grade
  @attr('string') declare driver3?: string; // Driver 3 name
  @attr('string') declare driver3gr?: string; // Driver 3 grade
  @attr('string') declare school: string; // School
  @attr('string') declare coach: string; // Coach's name
  @attr('string') declare email: string; // Coach's email
  @attr('string') declare ph: string; // Coach's phone #

  // Check-in information
  @attr('number',{  // amount the entry was invoiced.
     defaultValue: 0,
  }) declare invoiced: number;

  @attr('number', { // Amount entry paid.
     defaultValue: 0
  }) declare paid: number;

  @attr('string',{ // Unpaid / Cash / Credit Card / Cheque / Invoiced
    defaultValue: "UNPAID",
  }) declare paymentType: ("UNPAID" | "CASH" | "CREDIT CARD" | "CHEQUE" | "INVOICED"| "COMPLEMENTARY");

  @attr('date') declare registered?: number | "now()"; // Time the entry was created.

  @attr('string', { // Checked-in / Withdrawn / Unknown
    defaultValue: "UNKNOWN",
  }) declare checkInStatus: ("CHECKED-IN" | "WITHDRAWN" | "UNKNOWN");

  @attr('string', { // Checked-in / Withdrawn / Unknown
    defaultValue: "UNSEEN",
  }) declare slottedStatus: ("UNSEEN" | "CONFIRMED" | "STANDBY" | "DECLINED");

  @attr('boolean', { // Has the entry successfully completed measurement.
    defaultValue: false,
  }) declare measured: boolean;

  @attr('boolean',{ // Has the entry been accepted for competition
    defaultValue: false,
  }) declare participated?: boolean;

  @hasMany('measurement', { // All the measurements taken of this competitor.
    async: false,
    inverse: 'robot',
  }) declare measurement: SyncHasMany<RobotMeasurementModel>; //: AsyncBelongsTo<RobotModel>;

  @belongsTo('competition', {
    async: false,
    inverse: 'robot',
  }) declare competition: CompetitionModel;

  @belongsTo('ringAssignment', {
    async: false,
    inverse: 'robot',
  }) declare ringAssignment: RingAssignmentModel

  get isPaid() {
    if (this.paid > 0.0 || this.paymentType === "INVOICED") {
      return true;
    } else {
      return false;
    }
  }

  get readyToCompete(): ("UNSEEN" | "CONFIRMED" | "STANDBY" | "DECLINED") {
    if(
          this.isPaid === true
       && this.measured === true
    ){
      if(this.slottedStatus === "CONFIRMED"){
        return "CONFIRMED";
      }else if(this.slottedStatus === "STANDBY"){
        return "STANDBY";
      }
    }else if(this.slottedStatus === "DECLINED"){
      return "DECLINED";
    }
    return "UNSEEN";
  }

  get isPayable() : boolean {
    let paid = this.paid;
    //let withdrawn = this.withdrawn;
    let withdrawn = this.checkInStatus === "WITHDRAWN";

    return ((paid === null || paid === 0) && (!withdrawn));
  }

  get formattedPaidDollars(): string {
    if(this.paymentType === "INVOICED"){
      return "INVOICED";
    } else {
      return formatDollars(this.paid);
    }
  }

  get formattedInvoicedDollars(): string {
    var invoiced = this.invoiced;
    return formatDollars(invoiced);
  }

  get formattedMeasured(): string {
    if (this.measured) {
      return "MEASURED";
    } else {
      return "";
    }
  }
}
