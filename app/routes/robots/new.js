import { set } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
	model(params, transition) {
		var store = this.store;
		store.findAll('competition');
		var competition = store.peekRecord('competition', transition.queryParams.competition);
		console.log('creating a new robot in ' + competition.get('name'));
		var robot = store.createRecord('robot', { competition: competition });
		set(robot, 'tookPayment', " ");
		set(robot, 'paid', " ");
		if(competition === "RC1"){
			set(robot, 'invoiced', "5.00");
		} else {
			set(robot, 'invoiced', "10.00");
		}
		return robot;
	},

	setupController: function(controller, model) {
    	this._super(controller, model);
    	controller.set('competitions', this.store.peekAll('competition'));
  	}
});
