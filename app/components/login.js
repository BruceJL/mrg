import {
  inject as service
} from '@ember/service';
import {
  action,
} from '@ember/object';

import Component from '@ember/component';

export default class loginComponent extends Component {
  @service session;

  @action
  async authenticate() {
    let {
      identification,
    } = this.getProperties('identification');
    try {
      await this.session.authenticate('authenticator:simple', identification);
    } catch (error) {
      this.set('errorMessage', error.error || error);
    }

    // if (this.session.isAuthenticated) {
    //   // What to do with all this success?
    // }
  }

  @action
  invalidateSession() {
    this.session.invalidate();
  }

}
