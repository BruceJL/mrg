import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';
import {
  isEmpty
} from '@ember/utils';
import {
  resolve
} from 'rsvp';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  load() {
    this.session.setup();
    let userId = this.get('session.data.authenticated.user_id');
    if (!isEmpty(userId)) {
      return this.get('store').findRecord('user', userId).then((user) => {
        this.set('user', user);
      });
    } else {
      return resolve();
    }
  }
}s;
