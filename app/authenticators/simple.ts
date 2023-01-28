import {
  Promise
} from 'rsvp';

//@ts-ignore
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import {
  debug,
} from '@ember/debug';

import { inject as service } from '@ember/service';


export default class SimpleAuthenticator extends BaseAuthenticator {
  @service declare session: any; //EmberSimpleAuthSession

  restore(data: any) {
    let promise = new Promise(function(resolve, reject) {
      resolve(data);
    });
    return promise;
  }

  authenticate(data: string) {
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

  invalidate(data: any) {
    return Promise.resolve(data);
  }
}
