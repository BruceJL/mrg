import { service } from '@ember/service';
import Controller from '@ember/controller'


export default class ApplicationController extends Controller {
  @service session; //EmberSimpleAuthSession
}
