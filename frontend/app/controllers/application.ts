import {
  inject as service
} from '@ember/service';
import {
  action,
} from '@ember/object';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service declare session: any; //EmberSimpleAuthSession

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
