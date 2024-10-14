import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

export default class NavigationController extends Component {
  @service session; //EmberSimpleAuthSession

  @action
  invalidateSession() {
    this.session.invalidate();
  }

  @action
  transitionToLogin(){

  }
}
