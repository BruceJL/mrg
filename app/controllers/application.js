import {
  inject as service
} from '@ember/service';
import {
  action,
} from '@ember/object'; 
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service session;

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
