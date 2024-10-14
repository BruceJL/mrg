import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
type Transition = ReturnType<RouterService['transitionTo']>;

export default class Application extends Route {
  @service session; //EmberSimpleAuthSession

  async beforeModel(transition: Transition) {
    await this.session.setup();
    this.session.requireAuthentication(transition, 'login');
  }
}
