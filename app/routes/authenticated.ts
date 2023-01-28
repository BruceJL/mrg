import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service declare session: any; //EmberSimpleAuthSession

  beforeModel(transition: Transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}