import Controller from '@ember/controller';
import RobotModel from 'mrg-sign-in/models/robot';
import CheckinRoute from 'mrg-sign-in/routes/checkin';
import { ModelFrom } from '../routes/checkin';

export default class CheckInController extends Controller {
  declare model: ModelFrom<CheckinRoute>;

  get sortedAssignments(): Array<RobotModel> {
    return this.model.robot.slice().sortBy('name');
  }
}
