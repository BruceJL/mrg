import Model, {
  hasMany,
  belongsTo,
  attr,
  type AsyncHasMany,
  type AsyncBelongsTo,
} from '@ember-data/model';

import {computed} from '@ember/object';

import type CompetitionModel from './competition';
import type RobotMeasurementModel from './robot-measurement';

function formatDollars(
  amount: number
): string {
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
  @attr('string') declare driver1Gr: string; // Driver 1 grade
  @attr('string') declare driver2?: string; // Driver 2 name
  @attr('string') declare driver2Gr?: string; // Driver 2 grade
  @attr('string') declare driver3?: string; // Driver 3 name
  @attr('string') declare driver3Gr?: string; // Driver 3 grade
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

  //@attr('string') tookPayment; // name of the person who collected the money
  @attr('string',{ // Unpaid / Cash / Credit Card / Cheque / Invoiced
    defaultValue: "UNPAID",
  }) declare paymentType?: string;

  @attr('date') declare registered?: number; // Time the entry was created.

  @attr('string', { // Checked-in / Withdrawn / Unseen
    defaultValue: "UNSEEN",
  }) declare status: string;

  @attr('boolean', { // Has the entry successfully completed measurement.
    defaultValue: false,
  }) declare measured: number;

  @attr('boolean',{ // Has the entry been accepted for competition
    defaultValue: false,
  }) declare participated?: boolean;

  @hasMany('robot-measurement', { // All the measurements taken of this competitor.
    async: true,
    inverse: null,
  }) declare measurements: AsyncHasMany<RobotMeasurementModel>;

  @belongsTo('competition', {
    async: false,
    inverse: 'robot',
  }) declare competition: CompetitionModel;

  @computed('paid')
  get isPaid() {
    let paid = this.paid;
    if (paid > 0.0) {
      return true;
    } else {
      return false;
    }
  }

  @computed('withdrawn', 'paid')
  get isPayable() : boolean {
    let paid = this.paid;
    //let withdrawn = this.withdrawn;
    let withdrawn = this.status === "WITHDRAWN";

    return ((paid === null || paid === 0) && (!withdrawn));
  }

  @computed('paid')
  get formattedPaidDollars(): string {
    let paid = this.paid;
    return formatDollars(paid);
  }

  @computed('invoiced')
  get formattedInvoicedDollars(): string {
    var invoiced = this.invoiced;
    return formatDollars(invoiced);
  }

  @computed('slottedStatus', 'status')
  get humanFriendlyStatus(): string {
    if (this.status === "UNKNOWN") {
      return "";
    }
    if (this.status === "WITHDRAWN") {
      return "WITHDRAWN";
    } else {
      return this.status;
    }
  }

  @computed('measured')
  get formattedMeasured(): string {
    if (this.measured) {
      return "MEASURED";
    } else {
      return "";
    }
  }

  @computed(
    'competition.robots.@each.status',
    'competition.robots.@each.measured',
  )
  get slottedStatus(): string | undefined {
      let r = this.get('driver1');
      let competition: CompetitionModel = this.get('competition');
      if (competition === undefined) {
          return "unknown";
      } else {
          let robots = competition.hasMany("robot").value()?.slice().sortBy("registered");
          if(robots === null || robots === undefined){
              return "unknown";
          }
          let robotslength = competition.hasMany("robot").ids().length;
          let maxCompetitors = competition.get('maxEntries');
          let checkedInOrUnknownCount = 0;
          let checkedInCount = 0;
          let id = this.get('id');
          let item = null;
          let itemId = "";
          let index = 0;
          let itemStatus = "";
          let itemMeasured = false;
          let status = this.get("status");
          let slottedStatus = "";

          if (status === "WITHDRAWN") {
              return "withdrawn";
          }
          if (status === "UNKNOWN"){
              return "unknown";
          }

          while (!slottedStatus && checkedInOrUnknownCount < robotslength) {
              item = robots[index];
              if(!(item === undefined || item === null)){
                  itemStatus = item.get("status");
                  itemMeasured = item.measured;
                  itemId = item.id;

                  if (itemId === id) {
                    // Declined status is easy.
                    if (checkedInCount >= maxCompetitors) {
                        slottedStatus = "declined";

                      // standby status
                    } else if (checkedInOrUnknownCount >= maxCompetitors) {
                        slottedStatus = "standby";

                      // confirmed status. There's room at the inn.
                    } else if (checkedInCount <= maxCompetitors) {
                      if (itemStatus === "CHECKED-IN" && itemMeasured===true){
                          slottedStatus = "confirmed";
                      } else {
                          slottedStatus = "unknown"
                      }
                    }
                  }
                  if (itemStatus === "CHECKED-IN") {
                      checkedInOrUnknownCount++;
                      checkedInCount++;
                  } else if (itemStatus === "UNKNOWN") {
                      checkedInOrUnknownCount++;
                  }
                  index++;
              }
              return slottedStatus;
          }
      }
      return "unknown";
  }
}
