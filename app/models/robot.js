import DS from 'ember-data';
import Ember from 'ember';

function formatDollars(amount){
	if(amount > 0){
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

	isPaid: Ember.computed('paid', function(){
		var paid = this.get('paid');
		if(paid > 0){
			return true;
		} else{
			return false;
		}
	}),

	formattedPaidDollars: Ember.computed('paid', function(){
		var paid = this.get('paid');
  		return formatDollars(paid);
	}),

	formattedInvoicedDollars: Ember.computed('invoiced', function(){
		var invoiced = this.get('invoiced');
		return formatDollars(invoiced);
	}),

	formattedSignedIn: Ember.computed('signedIn', 'withdrawn', function(){
		if(this.get('signedIn') === true){
			return "IN";
		} else if(this.get('withdrawn') === true){
			return "WITHDRAWN";
		} else {
			return "";
		}
	}),

	formattedMeasured: Ember.computed('measured', function(){
		if(this.get('measured') === true){
			return "MEASURED";
		} else {
			return "";
		}
	}),

	formattedLate: Ember.computed('late', function(){
		if(this.get('late') === true){
			return "LATE";
		} else {
			return "ON TIME";
		}
	}),
});
