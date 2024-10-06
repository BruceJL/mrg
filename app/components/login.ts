import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Component from '@glimmer/component';

export default class loginComponent extends Component {
  @service declare session: any; //EmberSimpleAuthSession

  identification: string = '';

  @action
  async authenticate() {
    // let {
    //   identification,
    // } = this.identification;
    // try {
    //   await this.session.authenticate('authenticator:simple', identification);
    // } catch (error) {
    //   this.set('errorMessage', error.error || error);
    // }
    // if (this.session.isAuthenticated) {
    //   // What to do with all this success?
    // }
  }

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
