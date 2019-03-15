import Route from '@ember/routing/route';

export default Route.extend({
  // putting this variable here makes it persistant across
	// visits to this page.
	selectedMeasurementOption: "Mass",
	Measurer: "Insert name here!",

	model(params) {
		console.log("Changing route to: robot " + params.robot_id);
	  this.store.findAll('competition', {reload: true});
		return this.store.findRecord('robot',
		  params.robot_id, {include: 'robotMeasurement'});
	},

	setupController: function(controller, model) {
		  this._super(controller, model);
    	controller.set('competitions', this.store.peekAll('competition'));
  }
});
