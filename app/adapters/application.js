import Ember from 'ember';
import DS from 'ember-data';
import ENV from 'mrg-sign-in/config/environment';

var hostValue = '';
var nameSpace = 'mrg';
if (ENV.environment === 'development') {
	hostValue = 'http://registration:5000';
	//hostValue = 'http://localhost:1337';
	//nameSpace = '';
}

export default DS.RESTAdapter.extend({
	namespace: nameSpace,
	host: hostValue,

	//So ember is currently changing the model name of ring-assignment
	//to ringAssignments instead of ring-assignments.
	//This would appear to be fixed as per 
	//https://github.com/emberjs/data/issues/2318 by I'm seeing otherwise
	//so I've implimented the fix listed in
	//https://github.com/ember-cli/ember-cli/issues/2906
	pathForType: function(type) {
    	var dasherized = Ember.String.dasherize(type);
    	return Ember.String.pluralize(dasherized);
  	},

	shouldReloadAll(store, snapshotsArray) {
    	return true;
  	},

  	shouldBackgroundReloadAll(store, snapshotsArray) {
	    return true;
  	}
});
