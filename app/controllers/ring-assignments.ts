import { service } from '@ember/service';
import DS from 'ember-data';
import Controller from '@ember/controller';
import RobotModel from 'mrg-sign-in/models/robot';

export default class RingAssignmentController extends Controller {
  @service declare store: DS.Store;

  get sortedAssignments(): Array<RobotModel> {
    return this.store.peekAll('ringAssignment').slice().sortBy('robot.name');
  }
}

