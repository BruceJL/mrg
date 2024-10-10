import RobotModel from 'mrg-sign-in/models/robot';
import CheckinRoute from 'mrg-sign-in/routes/checkin';
import { ModelFrom } from '../routes/checkin';
import RefreshedController from './RefreshedController';

export default class CheckInController extends RefreshedController {
  declare model: ModelFrom<CheckinRoute>;

  get sortedAssignments(): Array<RobotModel> {
    return this.model.robot.slice().sortBy('name');
  }
}
