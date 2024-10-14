import { service } from '@ember/service';
import { action } from '@ember/object';

import Controller from '@ember/controller';
import type { Registry as Services } from '@ember/service';

export default class loginComponent extends Controller {
  @service declare session: Services['session']; //EmberSimpleAuthSession

  identification = '';

  @action
  async authenticate(e) {
    console.log('login.ts: authenticating:' + this.identification);
    try {
      await this.session.authenticate(
        'authenticator:simple',
        this.identification,
      );
    } catch (error) {
      if (typeof error == 'string') {
        confirm(error);
      }
    }

    if (this.session.isAuthenticated) {
      console.log('login.ts: authentication successful!');
    }
  }

  @action
  updateIdentification(e) {
    this.identification = e.target.value;
  }
}
