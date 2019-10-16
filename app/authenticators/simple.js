//Just a simple authenticator. Makes sure there's something
//in the string and then gives the thumbs up.

import {
  Promise
} from 'rsvp';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
  restore(data) {
    var promise = new Promise(function(resolve, reject) {
      resolve(true);
    });
    return promise;
  },
  authenticate(fullName) {
    var promise = new Promise(function(resolve, reject) {
      //TODO: Use a regex to detect letters-space-letters.
      if (fullName !== '') {
        resolve(true);
      } else {
        reject('Please enter a name.');
      }
    });
    return promise;
  }
});
