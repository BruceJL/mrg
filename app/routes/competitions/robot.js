import Ember from 'ember';

export default Ember.Route.extend({
	model(params, transition) {
		var store = this.get('store');
		
		//TODO fix this so it doesn't need to get every robot.
		var robot = store.findRecord('robot',  params.robot_id);
		var competition = store.findAll('competition');		
		return robot;
	},
	
	setupController: function(controller, model) {
    	this._super(controller, model);
    	controller.set('competitions', this.get('store').peekAll('competition'));
  	}
});
