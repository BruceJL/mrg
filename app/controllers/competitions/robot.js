import Ember from 'ember';

import RobotValidation from '../../validations/robot';

export default Ember.Controller.extend({
	RobotValidation,
	competition: null,
	queryParams: ['competition'],

	actions: {
		done(){
			var model = this.get('model');
			var competition = Ember.get(model, 'comp');
			this.transitionToRoute('competitions.show', competition);
			//history.back();
		},
		
		updateCompetition(changeset, id){
			var comp = this.get('store').peekRecord('competition', id);    	
			changeset.set('comp', comp);			
		}, 

		changeRobotStatus(property, value){
			Ember.set(this.get('model'), property, value);
			this.get('model').save();
		}
	}
});