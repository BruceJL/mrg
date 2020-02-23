import {
  Promise
} from 'rsvp';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import {
  debug,
} from '@ember/debug';

export default class SimpleAuthenticator extends BaseAuthenticator {

  restore(data) {
    let promise = new Promise(function(resolve, reject) {
      resolve(data);
    });
    return promise;
  }

  authenticate(data) {
    let fullname = data;
    debug("authenticating " + fullname);
    if (fullname !== undefined) {
      return Promise.resolve({
        fullname
      });
    } else {
      return Promise.reject('Please enter a name.');
    }

  }

  invalidate(data) {
    return Promise.resolve(data);
  }
}
