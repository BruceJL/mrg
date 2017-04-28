import Ember from 'ember';

export default Ember.Controller.extend({
  	sortedAssignments: Ember.computed('model.@each.ringAssignments', function(){
		return this.get('model').get('ringAssignments').sortBy('robot.robot');
	})
});
