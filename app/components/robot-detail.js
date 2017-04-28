import Ember from 'ember';

export default Ember.Component.extend({
	tagName: '', //removes <div> tag around component.

	actions: {
		updateCompetition(changeset, id){
    		this.sendAction('updateCompetition', changeset, id);
    	}
	}
});
