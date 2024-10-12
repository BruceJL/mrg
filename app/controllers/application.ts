import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service declare session: any; //EmberSimpleAuthSession

  identification: string = '';

  @action
  invalidateSession() {
    this.session.invalidate();
  }

  @action
  async authenticate() {
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

    // if (this.session.isAuthenticated) {
    //   // What to do with all this success?
    // }
  }
}
