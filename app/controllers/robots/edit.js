import Ember from 'ember';

import RobotValidation from '../../validations/robot';

export default Ember.Controller.extend({
	RobotValidation,

	actions: {
		done(){
			history.back();
		},

		updateCompetition(changeset, id){
			var comp = this.get('store').peekRecord('competition', id);    	
			changeset.set('comp', comp);			
		},

		changeRobotStatus(property, value){
			var model = Ember.get(this, 'model');
			console.log("changing " + property + " to " + value);
			Ember.set(model, property, value);
			model.save();
		}
	}
});