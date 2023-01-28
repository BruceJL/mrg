import {
  inject as service
} from '@ember/service';
import {
  action,
} from '@ember/object';

import Controller from '@ember/controller';

export default class loginComponent extends Controller {
  @service declare session: any; //EmberSimpleAuthSession

  identification: string = "";

  @action
  async authenticate() {
    try {
      await this.session.authenticate('authenticator:simple', this.identification);
    } catch (error) {
      let errorMessage = error;
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
