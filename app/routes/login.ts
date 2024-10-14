import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
type Transition = ReturnType<RouterService['transitionTo']>;

export default class LoginRoute extends Route {
  @service session;

  beforeModel(transition: Transition) {
    this.session.prohibitAuthentication('/');
  }
}
