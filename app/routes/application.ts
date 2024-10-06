import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

export default class Application extends Route {
  @service declare session: Services['session']; //EmberSimpleAuthSession

  beforemodel(transition: Transition) {
    super.beforeModel(transition);
    this.session.setup();
    this.session.requireAuthentication(transition, 'login');
  }
}
