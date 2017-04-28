import Ember from 'ember';

export default Ember.Controller.extend({
  	sortedAssignments: Ember.computed('model.@each.robots', function(){
		return this.get('model').get('robots').sortBy('robot');
	})
});
