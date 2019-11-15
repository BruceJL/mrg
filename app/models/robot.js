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

  @attr('string') robot;
  @belongsTo('competition') competition;
  @attr('string') driver1;
  @attr('string') driver1Gr;
  @attr('string') driver2;
  @attr('string') driver2Gr;
  @attr('string') driver3;
  @attr('string') driver3Gr;
  @attr('string') school;
  @attr('string') coach;
  @attr('string') email;
  @attr('string') ph;
  @attr('number') invoiced;
  @attr('string') tookPayment;
  @attr('number') paid;
  @attr('boolean') signedIn;
  @attr('boolean') late;
  @attr('boolean') measured;
  @attr('boolean') withdrawn;
  @hasMany('robot-measurement') measurements; // used to be a hasMany, now readonly?

  @computed('paid')
  get isPaid() {
    var paid = this.paid;
    if (paid > 0) {
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
  get formattedPaidDollars(){
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
