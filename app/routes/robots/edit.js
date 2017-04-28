import Ember from 'ember';


export default Ember.Route.extend({
	model(params) {
	    this.get('store').findAll('competition', {reload: true});
		return this.get('store').findRecord('robot', params.robot_id);
	},

	setupController: function(controller, model) {
    	this._super(controller, model);
    	controller.set('competitions', this.get('store').peekAll('competition'));
  	},
});