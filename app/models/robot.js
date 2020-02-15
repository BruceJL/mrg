import DS from 'ember-data';

const {
  hasMany,
  belongsTo,
  Model,
  attr,
} = DS;

import {
  get,
} from '@ember/object';

import {
  computed,
  setProperties,
} from '@ember/object';

import {
  debug,
} from '@ember/debug';

function formatDollars(amount) {
  if (amount > 0) {
    var formatted = parseFloat(amount, 10).toFixed(2);
    return '$' + formatted;
  } else {
    return "";
  }
}

export default class RobotModel extends Model {

  // competitor information
  @attr('string') robot;
  @belongsTo('competition') competition;
  @attr('string') driver1; // Driver1 name
  @attr('string') driver1Gr; // Driver 1 grade
  @attr('string') driver2; // Driver 2 name
  @attr('string') driver2Gr; // Driver 2 grade
  @attr('string') driver3; // Driver 3 name
  @attr('string') driver3Gr; // Driver 3 grade
  @attr('string') school; // School
  @attr('string') coach; // Coach's name
  @attr('string') email; // Coach's email
  @attr('string') ph; // Coach's phone #

  // Check-in information
  @attr('number') invoiced; // amount the entry was invoiced.
  @attr('number') paid; // Amount entry paid.
  //@attr('string') tookPayment; // name of the person who collected the money
  @attr('string') paymentType; // Cash / Credit Card / Cheque / Invoiced
  @attr('date') registered; // Time the entry was created.
  @attr('string') status; // Checked-in / Withdrawn
  @attr('boolean') measured; // Has the entry successfully completed measurement.
  @attr('boolean') participated; // Has the entry been accepted for competition
  @hasMany('robot-measurement', {
    async: false
  }) measurements; // All the measurements taken of this competitor.

  @computed('paid')
  get isPaid() {
    var paid = this.paid;
    if (paid > 0.0) {
      return true;
    } else {
      return false;
    }
  }

  @computed('withdrawn', 'paid')
  get isPayable() {
    let paid = this.paid;
    //let withdrawn = this.withdrawn;
    let withdrawn = this.status === "WITHDRAWN";

    return ((paid === null || paid === 0) && (!withdrawn));
  }

  @computed('paid')
  get formattedPaidDollars() {
    var paid = this.paid;
    return formatDollars(paid);
  }

  @computed('invoiced')
  get formattedInvoicedDollars() {
    var invoiced = this.invoiced;
    return formatDollars(invoiced);
  }

  @computed('slottedStatus', 'status')
  get humanFriendlyStatus() {
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
  get formattedMeasured() {
    if (this.measured) {
      return "MEASURED";
    } else {
      return "";
    }
  }

  @computed('competition.robots.@each.status')
  get slottedStatus() {
    let competition = this.get('competition');
    if (competition == undefined) {
      return "unknown";
    } else {
      let robots = competition.get('robots').sortBy('registered');
      let maxCompetitors = competition.get('maxEntries');
      let checkedInOrUnknownCount = 0;
      let checkedInCount = 0;
      let id = this.get('id');
      let item = null;
      let itemId = "";
      let index = 0;
      let itemStatus = "";
      let status = this.get("status");
      let slottedStatus = null;

      if (status === "WITHDRAWN") {
        return "withdrawn";
      }
      if (status === "UNKNOWN"){
        return "unknown";
      }

      while (!slottedStatus && checkedInOrUnknownCount < robots.length) {
        item = robots[index];
        itemStatus = item.status;
        itemId = item.get('id');

        if (itemId === id) {
          // Declined status is easy.
          if (checkedInCount >= maxCompetitors) {
            slottedStatus = "declined";

            // standby status
          } else if (checkedInOrUnknownCount >= maxCompetitors) {
            slottedStatus = "standby";

            // confirmed status. There's room at the inn.
          } else if (checkedInCount <= maxCompetitors) {
            if (itemStatus === "CHECKED-IN") {
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
}
