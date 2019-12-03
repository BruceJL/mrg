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
  @attr('string') payment_type; // Cash / Credit Card / Cheque / Invoiced
  @attr('date') registered; // Time the competitor's entry was created.
  @attr('boolean') signedIn; // has the competitor checked-in at the check in desk - DEPRECIATED.
  @attr('boolean') late; // Did the competitor register after the deadline. - DEPRECIATED.
  @attr('boolean') withdrawn; // Has the competitor withdrawn. - DEPRECIATED.
  @attr('string') status; //   Checked-in / Withdrawn / Standby / Declined.
  @attr('boolean') measured; // Has the competitor successfully completed measurement.
  @hasMany('robot-measurement') measurements; // All the measurements taken of this competitor.

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
    let withdrawn = this.withdrawn;

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

  @computed('signedIn', 'withdrawn')
  get formattedSignedIn() {
    if (this.signedIn === true) {
      return "IN";
    } else if (this.withdrawn === true) {
      return "WITHDRAWN";
    } else {
      return "";
    }
  }

  @computed('measured')
  get formattedMeasured() {
    if (this.measured === true) {
      return "MEASURED";
    } else {
      return "";
    }
  }

  @computed('late')
  get formattedLate() {
    if (this.late === true) {
      return "LATE";
    } else {
      return "ON TIME";
    }
  }
}
