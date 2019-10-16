import {
  computed
} from '@ember/object';
import DS from 'ember-data';

function formatDollars(amount) {
  if (amount > 0) {
    var formatted = parseFloat(amount, 10).toFixed(2);
    return '$' + formatted;
  } else {
    return "";
  }
}

export default DS.Model.extend({

  robot: DS.attr('string'),
  competition: DS.belongsTo('competition'),
  driver1: DS.attr('string'),
  driver1Gr: DS.attr('string'),
  driver2: DS.attr('string'),
  driver2Gr: DS.attr('string'),
  driver3: DS.attr('string'),
  driver3Gr: DS.attr('string'),
  school: DS.attr('string'),
  coach: DS.attr('string'),
  email: DS.attr('string'),
  ph: DS.attr('string'),
  invoiced: DS.attr('number'),
  tookPayment: DS.attr('string'),
  paid: DS.attr('number'),
  signedIn: DS.attr('boolean'),
  late: DS.attr('boolean'),
  measured: DS.attr('boolean'),
  withdrawn: DS.attr('boolean'),
  measurements: DS.hasMany('robot-measurement'),

  isPaid: computed('paid', function() {
    var paid = this.paid;
    if (paid > 0) {
      return true;
    } else {
      return false;
    }
  }),

  isPayable: computed('withdrawn', 'paid', function() {
    let paid = this.paid;
    let withdrawn = this.withdrawn;

    return ((paid === null || paid === 0) && (!withdrawn));

  }),

  formattedPaidDollars: computed('paid', function() {
    var paid = this.paid;
    return formatDollars(paid);
  }),

  formattedInvoicedDollars: computed('invoiced', function() {
    var invoiced = this.invoiced;
    return formatDollars(invoiced);
  }),

  formattedSignedIn: computed('signedIn', 'withdrawn', function() {
    if (this.signedIn === true) {
      return "IN";
    } else if (this.withdrawn === true) {
      return "WITHDRAWN";
    } else {
      return "";
    }
  }),

  formattedMeasured: computed('measured', function() {
    if (this.measured === true) {
      return "MEASURED";
    } else {
      return "";
    }
  }),

  formattedLate: computed('late', function() {
    if (this.late === true) {
      return "LATE";
    } else {
      return "ON TIME";
    }
  }),
});
