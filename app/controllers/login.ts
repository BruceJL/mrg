import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Controller from '@ember/controller';
import type { Registry as Services } from '@ember/service';


export default class loginComponent extends Controller {
  @service declare session: Services['session']; //EmberSimpleAuthSession

  identification: string = '';

  @action
  async authenticate() {
    try {
      await this.session.authenticate(
        'authenticator:simple',
        this.identification,
      );
    } catch (error) {
      const errorMessage = error;
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
