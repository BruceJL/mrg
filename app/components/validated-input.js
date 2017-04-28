import Ember from 'ember';

export default Ember.Component.extend({
	actions: {
		validateProperty(changeset, propertyName){
			console.log("Checking " + propertyName);
			return changeset.validate(propertyName);
		}
	}
});
