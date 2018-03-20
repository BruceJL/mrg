import Ember from 'ember';

function formatDollars(amount){
	if(amount > 0){
		var formatted = parseFloat(amount, 10).toFixed(2);
			return '$' + formatted;
		} else {
			return "";
	}
}

function getTotalDollars(items, property){
	var total = 0.0;
	items.forEach(function(item){
		total += Number(item.get(property));
	});
	return formatDollars(total);
}

export default Ember.Controller.extend({

	queryParams: ['schoolFilter', 'robotFilter', 'robotIDFilter'],

	filteredRobots: Ember.computed('model', 'robotFilter', 'schoolFilter', 'robotIDFilter', function(){
		let returnRobots = Ember.get(this, 'model');
		let robotFilter = Ember.get(this, 'robotFilter');
		let schoolFilter = Ember.get(this, 'schoolFilter');
		let robotIDFilter = Ember.get(this, 'robotIDFilter');
		let regex;

    if(robotIDFilter && robotIDFilter.length>2){
			returnRobots = returnRobots.filter(function(i) {
				if(i.get('id') === robotIDFilter){
					return true;
				} else {
					return false;
				}
			});
		} else {

			if(schoolFilter && schoolFilter.length>1){
				regex = new RegExp(schoolFilter, "i");
				returnRobots = returnRobots.filter(function(item) {
					let data = item.get('school');
					return regex.test(data);
				});
			}

			if(robotFilter && robotFilter.length>1){
				regex = new RegExp(robotFilter, "i");
				returnRobots = returnRobots.filter(function(item) {
					let data = item.get('robot');
					return regex.test(data);
				});
			}
		}

		//Return the results of the two filters.
		return returnRobots;
	}),

	invoicedTotal: Ember.computed('filteredRobots', function(){
		let items = Ember.get(this, 'filteredRobots');
		return getTotalDollars(items, 'invoiced');
	}),

	paidTotal: Ember.computed('filteredRobots', function(){
		let items = Ember.get(this, 'filteredRobots');
		return getTotalDollars(items, 'paid');
	}),

	actions: {
		selectCompetition(value) {
			if(value === 'All'){
				value = "";
			}
			this.set('competition', value);
			if(value){
				this.transitionToRoute('robots', { queryParams:{'competition': value }});
			}
		}
	}
});
