import { computed, get } from '@ember/object';
import { A } from '@ember/array';
import Controller from '@ember/controller';

//Good checkbox model described here:
//https://codeflip.przepiora.ca/blog/2014/05/22/ember-js-recipes-checkboxable-index-pages-using-itemcontroller/
//and here:
//https://alexdiliberto.com/posts/ember-toggle-all-checkbox/
//but both ObjectController and ArrayController are depreciated/superceded by controller
//so that sucks.

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

export default Controller.extend({

	queryParams: ['schoolFilter', 'robotFilter'],
	selectedRobots: A(),

	filteredRobots: computed('model', 'robotFilter', 'schoolFilter', function(){
		let returnRobots = get(this, 'model');
		let robotFilter = get(this, 'robotFilter');
		let schoolFilter = get(this, 'schoolFilter');
		let selectedRobots = get(this, 'selectedRobots');
		let regex;

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
		//Remove any selectedRobots that are no longer visible.
    selectedRobots.forEach(function(i){
			if(!returnRobots.includes(i)){
				selectedRobots.removeObject(i);
			}
		});
		//Return the results of the two filters.
		return returnRobots;
	}),

	invoicedTotal: computed('selectedRobots.[]', function(){
    console.log("computing invoiced total");
		let list = get(this, 'selectedRobots');
		return getTotalDollars(list, 'invoiced').toString();
	}),

	totalRobots: computed('selectedRobots.[]', function(){
		return this.selectedRobots.length;
	}),

	isPayDisabled: computed('totalRobots', function(){
		let count = get(this, 'totalRobots');
		return (count === 0);
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
		},

		robotSelected(item){
			console.log("Checking: " + item.get('robot').toString());
			return this.selectedRobots.includes(item);
		},

		checkboxClicked(item){
			let list = get(this, 'selectedRobots');
			if(list.includes(item)){
				list.removeObject(item);
				console.log("Removing: " + item.get('robot').toString());
			}else{
				list.addObject(item);
				console.log("Adding: " + item.get('robot').toString());
			}
			list.forEach(function(i){
				console.log("list contains " + i.get('robot') + " $" + i.get('invoiced'));
			});
			console.log("total:" + getTotalDollars(list, 'invoiced'));
		},

		pay(){
			let list = get(this, 'selectedRobots');
			let total = get(this, 'invoicedTotal');
			if(window.confirm("Take payment of " + total + "?")){
				list.forEach(function(i){
					i.set('paid', i.get('invoiced'));
					console.log("Marking " + i.get('robot') + " as paid.");
					i.save();
			  });
			list.clear();
		  }
		}
	}
});
