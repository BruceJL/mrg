import DS from 'ember-data';

const {
  hasMany,
  belongsTo,
  Model,
  attr,
  get
} = DS;

import {
  computed,
  setProperties
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
  @attr('number') invoiced; // amount the person was invoiced.
  @attr('number') paid; // Amount competitor paid.
  @attr('string') tookPayment; // name of the person who collected the money
  @attr('string') paymentType; // Cash / Credit Card / Cheque / Invoiced
  @attr('date') registered; // Time the competitor's entry was created.
  @attr('string') status; //   Checked-in / Withdrawn
  @attr('boolean') measured; // Has the competitor successfully completed measurement.
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
      return this.status + " - " + this.slottedStatus;
    }
  }

  @computed('status', 'competition.robots.@each.status')
  get slottedStatus() {
    let competition = this.get('competition');
    let robots = competition.get('robots').sortBy('registered');
    let maxCompetitors = competition.get('maxEntries');
    let index = 0;
    let confirmedRobotCount = 0;
    let withdrawnRobotCount = 0;
    let id = this.get('id');
    let item = null;
    let itemId = "";
    let itemStatus = "";
    let status = this.get("status");
    let slottedStatus = null;

    if (status === "UNKNOWN") {
      slottedStatus = "unknown";
    } else if (status === "WITHDRAWN") {
      slottedStatus = "withdrawn";
    } else if (status === "CHECKED-IN") {
      while (!slottedStatus && index < robots.length) {
        item = robots[index];
        itemStatus = item.status;
        itemId = item.get('id');
        if (itemStatus === "CHECKED-IN") {
          // Declined status is easy.
          if (confirmedRobotCount >= maxCompetitors) {
            if (itemId === id) {
              slottedStatus = "declined";
            }
          } else if (index - withdrawnRobotCount >= maxCompetitors) {
            if (itemId === id) {
              slottedStatus = "standby";
            }
          // Confirmed status is easy.
          } else if (confirmedRobotCount < maxCompetitors) {
            confirmedRobotCount++;
            if (itemId === id) {
              slottedStatus = "confirmed";
            }
          }
        }
        else if (itemStatus === "WITHDRAWN"){
          withdrawnRobotCount++;
        }
        index++;
      }
    }
    return slottedStatus;
  }
}
