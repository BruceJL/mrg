import Ember from 'ember';

export default Ember.Route.extend({
	model(params, transition) {
		var store = this.get('store');
		store.findAll('competition');
		var competition = store.peekRecord('competition', transition.queryParams.competition);
		console.log('creating a new robot in ' + competition.get('name'));
		var robot = store.createRecord('robot', { comp: competition });
		if(competition === "RC1"){
			Ember.set(robot, 'invoiced', "5.00");
		} else {
			Ember.set(robot, 'invoiced', "10.00");
		}
		return robot;
	},
	
	setupController: function(controller, model) {
    	this._super(controller, model);
    	controller.set('competitions', this.get('store').peekAll('competition'));
  	}
});
