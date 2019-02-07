import Ember from 'ember';
import DS from 'ember-data';
import pluralize from 'ember-inflector';
import ENV from 'mrg-sign-in/config/environment';

//var hostValue = '';
var nameSpace = '/api/mrg';

if (ENV.environment === 'development') {
	hostValue = 'http://registration';
	//hostValue = 'http://localhost:1337';
	//nameSpace = '';
}

export default DS.RESTAdapter.extend({
	namespace: nameSpace,
	//host: hostValue,

	shouldReloadAll(store, snapshotsArray) {
    	return true;
  	},

  	shouldBackgroundReloadAll(store, snapshotsArray) {
	    return true;
  	}
});
