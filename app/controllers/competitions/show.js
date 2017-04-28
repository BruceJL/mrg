import Ember from 'ember';

export default Ember.Controller.extend({

	queryParams: ['robotFilter'],

	//Filter the currently displayed robots by robot name
	filteredRobotsByName: Ember.computed('model', 'robotFilter', function(){
		var returnRobots = Ember.get(this, 'model').get('robots');
		var robotFilter = Ember.get(this, 'robotFilter');
		console.log(returnRobots);
		if(robotFilter && robotFilter.length > 1){
			var regex = new RegExp(robotFilter, "i");
			return returnRobots.filter(function(item) {
				var data = item.get('robot');
				return regex.test(data);	
			});
		} else {
			return returnRobots;
		}
	})
});
