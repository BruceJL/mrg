import DS from 'ember-data';
import ENV from 'mrg-sign-in/config/environment';

var hostValue = '';
var nameSpace = 'api/mrg';

if (ENV.environment === 'development') {
  hostValue = 'http://check-in';
  //hostValue = 'http://481.1045.ca:5309';
  //nameSpace = '';
}

export default DS.RESTAdapter.extend({
  namespace: nameSpace,
  host: hostValue,

  shouldReloadAll(store, snapshotsArray) {
      return true;
    },

    shouldBackgroundReloadAll(store, snapshotsArray) {
      return true;
    }
});
